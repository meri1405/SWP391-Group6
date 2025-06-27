import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    Tag,
    message,
    Row,
    Col,
    Tabs,
    Typography,
    Descriptions,
    Divider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    WarningOutlined,
    CheckOutlined,
    CloseOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { restockRequestApi } from '../../api/restockRequestApi';
import { medicalSupplyApi } from '../../api/medicalSupplyApi';
import { unitConversionApi } from '../../api/unitConversionApi';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const InventorySection = () => {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('medicines');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all'); // Add status filter
    const [messageApi, contextHolder] = message.useMessage();
    const [restockRequests, setRestockRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [availableUnits, setAvailableUnits] = useState([]);
    const [convertibleBaseUnits, setConvertibleBaseUnits] = useState([]);
    const [selectedDisplayUnit, setSelectedDisplayUnit] = useState('');

    const getStatusTag = (record) => {
        const quantityInBaseUnit = record.quantityInBaseUnit || 0;
        const minStockLevelInBaseUnit = record.minStockLevelInBaseUnit || 0;
        const isEnabled = record.enabled !== false; // Default to true if not specified
        
        if (!isEnabled) {
            return <Tag color="gray" icon={<CloseOutlined />}>Ngừng sử dụng</Tag>;
        }
        
        if (quantityInBaseUnit <= minStockLevelInBaseUnit) {
            return <Tag color="red" icon={<WarningOutlined />}>Sắp hết</Tag>;
        } else if (quantityInBaseUnit <= minStockLevelInBaseUnit * 1.5) {
            return <Tag color="orange">Tồn kho thấp</Tag>;
        } else {
            return <Tag color="green">Còn hàng</Tag>;
        }
    };

    const getCategoryTag = (category) => {
        const config = {
            painkiller: { color: 'blue', text: 'Giảm đau' },
            antibiotic: { color: 'purple', text: 'Kháng sinh' },
            vitamin: { color: 'orange', text: 'Vitamin' },
            supplement: { color: 'cyan', text: 'Thực phẩm bổ sung' },
            bandage: { color: 'cyan', text: 'Băng y tế' },
            gloves: { color: 'green', text: 'Găng tay' },
            equipment: { color: 'geekblue', text: 'Thiết bị' },
            antiseptic: { color: 'red', text: 'Sát trung' },
            medical_device: { color: 'magenta', text: 'Thiết bị y tế' },
            other: { color: 'default', text: 'Khác' }
        };
        
        // Safe access with fallback
        const categoryLower = category?.toLowerCase() || 'other';
        const categoryConfig = config[categoryLower] || config.other;
        
        return <Tag color={categoryConfig.color}>{categoryConfig.text}</Tag>;
    };

    // Load available units from unit conversions
    const loadAvailableUnits = useCallback(async () => {
        try {
            const response = await unitConversionApi.getAllUnits();
            if (response && Array.isArray(response)) {
                setAvailableUnits(response);
            } else {
                // Set default units if API fails or returns invalid data
                setAvailableUnits([
                    'mg', 'g', 'kg', 
                    'ml', 'l', 
                    'viên', 'hộp', 'lọ', 'chai', 'gói', 'tuýp',
                    'cuộn', 'cái', 'chiếc', 'bộ', 'hũ',
                    'unit', 'IU', 'mcg'
                ]);
            }
        } catch (error) {
            console.error('Error loading available units:', error);
            // Set default units if API fails
            setAvailableUnits([
                'mg', 'g', 'kg', 
                'ml', 'l', 
                'viên', 'hộp', 'lọ', 'chai', 'gói', 'tuýp',
                'cuộn', 'cái', 'chiếc', 'bộ', 'hũ',
                'unit', 'IU', 'mcg'
            ]);
        }
    }, []);

    // Load convertible base units when display unit changes
    const loadConvertibleBaseUnits = useCallback(async (displayUnit) => {
        if (!displayUnit) {
            setConvertibleBaseUnits([]);
            return;
        }
        
        try {
            const convertibleUnits = await unitConversionApi.getConvertibleUnits(displayUnit);
            setConvertibleBaseUnits(convertibleUnits || []);
        } catch (error) {
            console.error('Error loading convertible units:', error);
            // Fallback to allow same unit
            setConvertibleBaseUnits([displayUnit]);
        }
    }, []);

    // Handle display unit change
    const handleDisplayUnitChange = useCallback((value) => {
        setSelectedDisplayUnit(value);
        loadConvertibleBaseUnits(value);
        
        // Reset base unit if it's not convertible
        const currentBaseUnit = form.getFieldValue('baseUnit');
        if (currentBaseUnit && value) {
            // Check if current base unit is still valid
            unitConversionApi.getConvertibleUnits(value)
                .then(convertibleUnits => {
                    if (!convertibleUnits.includes(currentBaseUnit)) {
                        form.setFieldsValue({ baseUnit: undefined });
                    }
                })
                .catch(() => {
                    form.setFieldsValue({ baseUnit: undefined });
                });
        }
    }, [form, loadConvertibleBaseUnits]);

    const medicineColumns = [
        {
            title: 'Tên thuốc',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Loại',
            dataIndex: 'category',
            key: 'category',
            render: (category) => getCategoryTag(category),
        },
        {
            title: 'Số lượng',
            dataIndex: 'displayQuantity',
            key: 'displayQuantity',
            render: (displayQuantity, record) => {
                const quantity = displayQuantity || 0;
                const unit = record.displayUnit || 'unit';
                const baseQuantity = record.quantityInBaseUnit || 0;
                const baseUnit = record.baseUnit || 'unit';
                
                return (
                    <div>
                        <div>{quantity} {unit}</div>
                        {baseUnit !== unit && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                ({baseQuantity} {baseUnit})
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Hạn sử dụng',
            dataIndex: 'expirationDate',
            key: 'expirationDate',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'Không có',
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplier',
            key: 'supplier',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => getStatusTag(record),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record)}
                    >
                        Xóa
                    </Button>
                    {record.enabled ? (
                        <Button
                            type="default"
                            size="small"
                            onClick={() => handleDisableSupply(record)}
                            style={{ color: '#f5222d', borderColor: '#f5222d' }}
                        >
                            Vô hiệu
                        </Button>
                    ) : (
                        <Button
                            type="default"
                            size="small"
                            onClick={() => handleEnableSupply(record)}
                            style={{ color: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Kích hoạt
                        </Button>
                    )}
                    {(record.quantityInBaseUnit <= record.minStockLevelInBaseUnit) && (
                        <Tag color="warning" style={{ marginLeft: 8 }}>
                            Cần bổ sung
                        </Tag>
                    )}
                </Space>
            ),
        },
    ];

    const supplyColumns = [
        {
            title: 'Tên vật tư',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Loại',
            dataIndex: 'category',
            key: 'category',
            render: (category) => getCategoryTag(category),
        },
        {
            title: 'Số lượng',
            dataIndex: 'displayQuantity',
            key: 'displayQuantity',
            render: (displayQuantity, record) => {
                const quantity = displayQuantity || 0;
                const unit = record.displayUnit || 'unit';
                const baseQuantity = record.quantityInBaseUnit || 0;
                const baseUnit = record.baseUnit || 'unit';
                
                return (
                    <div>
                        <div>{quantity} {unit}</div>
                        {baseUnit !== unit && (
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                ({baseQuantity} {baseUnit})
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplier',
            key: 'supplier',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => getStatusTag(record),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record)}
                    >
                        Xóa
                    </Button>
                    {record.enabled ? (
                        <Button
                            type="default"
                            size="small"
                            onClick={() => handleDisableSupply(record)}
                            style={{ color: '#f5222d', borderColor: '#f5222d' }}
                        >
                            Vô hiệu
                        </Button>
                    ) : (
                        <Button
                            type="default"
                            size="small"
                            onClick={() => handleEnableSupply(record)}
                            style={{ color: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Kích hoạt
                        </Button>
                    )}
                    {(record.quantityInBaseUnit <= record.minStockLevelInBaseUnit) && (
                        <Tag color="warning" style={{ marginLeft: 8 }}>
                            Cần bổ sung
                        </Tag>
                    )}
                </Space>
            ),
        },
    ];

    // Restock request columns for manager review
    const requestColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Người yêu cầu',
            dataIndex: 'requestedByName',
            key: 'requestedByName',
            render: (text) => text || 'Không có thông tin',
        },
        {
            title: 'Ngày yêu cầu',
            dataIndex: 'requestDate',
            key: 'requestDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Độ ưu tiên',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => {
                const config = {
                    HIGH: { color: 'red', text: 'Cao' },
                    MEDIUM: { color: 'orange', text: 'Trung bình' },
                    LOW: { color: 'green', text: 'Thấp' }
                };
                return <Tag color={config[priority]?.color}>{config[priority]?.text || priority}</Tag>;
            },
        },
        {
            title: 'Số vật tư',
            key: 'itemCount',
            render: (_, record) => record.restockItems?.length || 0,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = {
                    PENDING: { color: 'blue', text: 'Chờ duyệt' },
                    APPROVED: { color: 'green', text: 'Đã duyệt' },
                    REJECTED: { color: 'red', text: 'Từ chối' },
                    COMPLETED: { color: 'purple', text: 'Hoàn thành' }
                };
                return <Tag color={config[status]?.color}>{config[status]?.text || status}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => {
                            setSelectedRequest(record);
                            setShowRequestModal(true);
                        }}
                    >
                        Xem
                    </Button>
                    {record.status === 'PENDING' && (
                        <>
                            <Button
                                type="default"
                                icon={<CheckOutlined />}
                                size="small"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
                                onClick={() => {
                                    setSelectedRequest(record);
                                    setShowApprovalModal(true);
                                }}
                            >
                                Duyệt
                            </Button>
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                size="small"
                                onClick={() => {
                                    Modal.confirm({
                                        title: 'Xác nhận từ chối',
                                        content: 'Bạn có chắc chắn muốn từ chối yêu cầu này?',
                                        onOk: () => handleRejectRequest(record.id, 'Từ chối bởi quản lý')
                                    });
                                }}
                            >
                                Từ chối
                            </Button>
                        </>
                    )}
                    {/* ĐÃ BỎ nút Hoàn thành & Nhập kho */}
                </Space>
            ),
        },
    ];

    const handleAdd = async (values) => {
        try {
            setLoading(true);
            
            console.log('Form values received:', values);
            
            // Map form values to API format using new DTO structure
            const supplyData = {
                name: values.name,
                category: values.category,
                displayQuantity: Number(values.displayQuantity) || 0,
                displayUnit: values.displayUnit,
                baseUnit: values.baseUnit,
                // Calculate quantityInBaseUnit (for now, same as displayQuantity until we have conversion)
                quantityInBaseUnit: Number(values.displayQuantity) || 0,
                supplier: values.supplier,
                minStockLevelInBaseUnit: Number(values.minStockLevelInBaseUnit) || 0,
                expirationDate: values.expirationDate || null, // Only for medicines
                location: values.location || 'Kho chính',
                description: values.description || `${values.category} - ${values.name}`,
                enabled: true
            };

            console.log('Supply data JSON:', JSON.stringify(supplyData, null, 2));

            if (editingRecord) {
                // Update existing supply
                await medicalSupplyApi.updateSupply(editingRecord.id, supplyData);
                messageApi.success('Cập nhật thành công');
            } else {
                // Create new supply
                await medicalSupplyApi.createSupply(supplyData);
                messageApi.success('Thêm mới thành công');
            }

            // Refresh the data
            await fetchMedicalSupplies();
            setShowAddModal(false);
            setEditingRecord(null);
            setSelectedDisplayUnit('');
            setConvertibleBaseUnits([]);
            form.resetFields();
        } catch (error) {
            console.error('Error saving supply:', error);
            console.error('Error details:', error.response?.data || error.message);
            messageApi.error(editingRecord ? 'Có lỗi xảy ra khi cập nhật' : 'Có lỗi xảy ra khi thêm mới');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setShowAddModal(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa bản ghi này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    setLoading(true);
                    await medicalSupplyApi.deleteSupply(record.id);
                    messageApi.success('Xóa thành công');
                    // Refresh the data
                    await fetchMedicalSupplies();
                } catch (error) {
                    console.error('Error deleting supply:', error);
                    messageApi.error('Có lỗi xảy ra khi xóa');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // Handle supply enable/disable
    const handleEnableSupply = async (record) => {
        try {
            setLoading(true);
            await medicalSupplyApi.enableSupply(record.id);
            messageApi.success('Đã kích hoạt vật tư y tế');
            await fetchMedicalSupplies();
        } catch (error) {
            console.error('Error enabling supply:', error);
            messageApi.error('Có lỗi xảy ra khi kích hoạt vật tư');
        } finally {
            setLoading(false);
        }
    };

    const handleDisableSupply = async (record) => {
        Modal.confirm({
            title: 'Xác nhận vô hiệu hóa',
            content: 'Bạn có chắc chắn muốn vô hiệu hóa vật tư này? Vật tư sẽ không được hiển thị trong danh sách sử dụng.',
            okText: 'Vô hiệu',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    setLoading(true);
                    await medicalSupplyApi.disableSupply(record.id);
                    messageApi.success('Đã vô hiệu hóa vật tư y tế');
                    await fetchMedicalSupplies();
                } catch (error) {
                    console.error('Error disabling supply:', error);
                    messageApi.error('Có lỗi xảy ra khi vô hiệu hóa vật tư');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // Fetch medical supplies from database
    const fetchMedicalSupplies = useCallback(async () => {
        try {
            setLoading(true);
            const allSupplies = await medicalSupplyApi.getAllSupplies();
            console.log('Fetched medical supplies:', allSupplies);
            
            // Separate medicines and supplies based on category
            const medicineCategories = ['painkiller', 'antibiotic', 'vitamin', 'supplement'];
            const medicineItems = allSupplies.filter(item => {
                const category = item.category?.toLowerCase() || '';
                return medicineCategories.includes(category) || 
                       item.name?.toLowerCase().includes('thuốc') ||
                       item.name?.toLowerCase().includes('viên') ||
                       item.name?.toLowerCase().includes('mg') ||
                       item.description?.toLowerCase().includes('thuốc');
            });
            
            const supplyItems = allSupplies.filter(item => {
                const category = item.category?.toLowerCase() || '';
                return !medicineCategories.includes(category) &&
                       !item.name?.toLowerCase().includes('thuốc') &&
                       !item.name?.toLowerCase().includes('viên') &&
                       !item.name?.toLowerCase().includes('mg') &&
                       !item.description?.toLowerCase().includes('thuốc');
            });
            
            console.log('Medicines:', medicineItems);
            console.log('Supplies:', supplyItems);
            
            setMedicines(medicineItems);
            setSupplies(supplyItems);
        } catch (error) {
            console.error('Error fetching medical supplies:', error);
            messageApi.error('Không thể tải danh sách vật tư y tế');
        } finally {
            setLoading(false);
        }
    }, [messageApi]);

    // Fetch restock requests for manager review
    const fetchRestockRequests = useCallback(async (status = 'all') => {
        try {
            setLoading(true);
            let requests;
            
            if (status === 'all') {
                requests = await restockRequestApi.getAllRequests();
            } else {
                requests = await restockRequestApi.getRequestsByStatus(status);
            }
            
            console.log('Fetched restock requests:', requests);
            if (requests.length > 0) {
                console.log('Sample request with items:', requests[0]);
                console.log('RestockItems in first request:', requests[0].restockItems);
            }
            setRestockRequests(requests);
        } catch (error) {
            console.error('Error fetching restock requests:', error);
            messageApi.error('Không thể tải danh sách yêu cầu bổ sung');
        } finally {
            setLoading(false);
        }
    }, [messageApi]);

    useEffect(() => {
        // Load medical supplies and available units on component mount
        fetchMedicalSupplies();
        loadAvailableUnits();
    }, [fetchMedicalSupplies, loadAvailableUnits]);

    useEffect(() => {
        if (activeTab === 'requests') {
            fetchRestockRequests(statusFilter);
        }
    }, [activeTab, statusFilter, fetchRestockRequests]);

    // Handle request approval
    const handleApproveRequest = async (requestId, approvedItems) => {
        try {
            // Transform the approvedItems array into a map of item ID to approval data
            const itemApprovals = {};
            approvedItems.forEach(item => {
                itemApprovals[item.itemId] = {
                    quantity: item.approvedQuantity,
                    unit: item.unit || 'unit'  // Use the item's unit or default to 'unit'
                };
            });
            
            const approvalData = {
                reviewerId: 1, // This should come from auth context
                reviewNotes: 'Approved by manager',
                itemApprovals: itemApprovals
            };
            
            await restockRequestApi.approveRequest(requestId, approvalData);
            messageApi.success('Đã duyệt yêu cầu bổ sung');
            fetchRestockRequests();
            setShowApprovalModal(false);
        } catch (error) {
            console.error('Error approving request:', error);
            messageApi.error('Có lỗi xảy ra khi duyệt yêu cầu');
        }
    };

    // Handle request rejection
    const handleRejectRequest = async (requestId, reason) => {
        try {
            const rejectionData = {
                reviewerId: 1, // This should come from auth context
                reviewNotes: reason
            };
            
            await restockRequestApi.rejectRequest(requestId, rejectionData);
            messageApi.success('Đã từ chối yêu cầu bổ sung');
            fetchRestockRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            messageApi.error('Có lỗi xảy ra khi từ chối yêu cầu');
        }
    };

    const getTableData = () => {
        if (activeTab === 'requests') {
            return restockRequests;
        }
        
        return activeTab === 'medicines'
            ? medicines.filter(medicine => {
                const matchesSearch = medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    medicine.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = categoryFilter === 'all' || medicine.category === categoryFilter;
                return matchesSearch && matchesCategory;
            })
            : supplies.filter(supply => {
                const matchesSearch = supply.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    supply.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = categoryFilter === 'all' || supply.category === categoryFilter;
                return matchesSearch && matchesCategory;
            });
    };

    const getTableColumns = () => {
        if (activeTab === 'requests') {
            return requestColumns;
        }
        return activeTab === 'medicines' ? medicineColumns : supplyColumns;
    };

    return (
        <div className="inventory-section">
            {contextHolder}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        <TabPane
                            tab={
                                <span>
                                    Thuốc ({medicines.length})
                                </span>
                            }
                            key="medicines"
                        />
                        <TabPane
                            tab={
                                <span>
                                    Vật tư ({supplies.length})
                                </span>
                            }
                            key="supplies"
                        />
                        <TabPane
                            tab={
                                <span>
                                    Yêu cầu bổ sung ({restockRequests.length})
                                </span>
                            }
                            key="requests"
                        />
                    </Tabs>
                    {activeTab !== 'requests' && (
                        <Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setEditingRecord(null);
                                    form.resetFields();
                                    setShowAddModal(true);
                                }}
                            >
                                Thêm mới
                            </Button>
                        </Space>
                    )}
                </div>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Tìm kiếm..."
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={activeTab === 'requests'}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            style={{ width: '100%' }}
                            value={activeTab === 'requests' ? statusFilter : categoryFilter}
                            onChange={activeTab === 'requests' ? setStatusFilter : setCategoryFilter}
                        >
                            {activeTab === 'requests' ? (
                                <>
                                    <Option value="all">Tất cả trạng thái</Option>
                                    <Option value="PENDING">Chờ duyệt</Option>
                                    <Option value="APPROVED">Đã duyệt</Option>
                                    <Option value="REJECTED">Từ chối</Option>
                                    {/* <Option value="COMPLETED">Hoàn thành</Option> */}
                                </>
                            ) : (
                                <>
                                    <Option value="all">Tất cả loại</Option>
                                    {activeTab === 'medicines' ? (
                                        <>
                                            <Option value="painkiller">Giảm đau</Option>
                                            <Option value="antibiotic">Kháng sinh</Option>
                                            <Option value="vitamin">Vitamin</Option>
                                            <Option value="supplement">Thực phẩm bổ sung</Option>
                                        </>
                                    ) : (
                                        <>
                                            <Option value="bandage">Băng y tế</Option>
                                            <Option value="gloves">Găng tay</Option>
                                            <Option value="equipment">Thiết bị</Option>
                                            <Option value="antiseptic">Sát trung</Option>
                                            <Option value="medical_device">Thiết bị y tế</Option>
                                            <Option value="other">Khác</Option>
                                        </>
                                    )}
                                </>
                            )}
                        </Select>
                    </Col>
                </Row>

                <Table
                    columns={getTableColumns()}
                    dataSource={getTableData()}
                    rowKey="id"
                    loading={loading && activeTab === 'requests'}
                    pagination={{ pageSize: 10 }}
                    locale={{
                        emptyText: activeTab === 'requests' 
                            ? 'Không có yêu cầu bổ sung nào' 
                            : 'Không có dữ liệu'
                    }}
                />
            </Card>

            <Modal
                title={editingRecord ? 'Sửa thông tin' : 'Thêm mới'}
                open={showAddModal}
                onCancel={() => {
                    setShowAddModal(false);
                    setEditingRecord(null);
                    setSelectedDisplayUnit('');
                    setConvertibleBaseUnits([]);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAdd}
                >
                    <Form.Item
                        name="name"
                        label={activeTab === 'medicines' ? 'Tên thuốc' : 'Tên vật tư'}
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input placeholder={`Nhập tên ${activeTab === 'medicines' ? 'thuốc' : 'vật tư'}`} />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Loại"
                        rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
                    >
                        <Select placeholder="Chọn loại">
                            {activeTab === 'medicines' ? (
                                <>
                                    <Option value="painkiller">Giảm đau</Option>
                                    <Option value="antibiotic">Kháng sinh</Option>
                                    <Option value="vitamin">Vitamin</Option>
                                    <Option value="supplement">Thực phẩm bổ sung</Option>
                                </>
                            ) : (
                                <>
                                    <Option value="bandage">Băng y tế</Option>
                                    <Option value="gloves">Găng tay</Option>
                                    <Option value="equipment">Thiết bị</Option>
                                    <Option value="antiseptic">Sát trung</Option>
                                    <Option value="medical_device">Thiết bị y tế</Option>
                                </>
                            )}
                            <Option value="other">Khác</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="displayQuantity"
                        label="Số lượng hiển thị"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng hiển thị' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="displayUnit"
                        label="Đơn vị hiển thị"
                        rules={[{ required: true, message: 'Vui lòng chọn đơn vị hiển thị' }]}
                    >
                        <Select 
                            placeholder="Chọn đơn vị hiển thị"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            onChange={handleDisplayUnitChange}
                        >
                            {availableUnits.map(unit => (
                                <Option key={unit} value={unit}>{unit}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="baseUnit"
                        label="Đơn vị cơ sở"
                        rules={[{ required: true, message: 'Vui lòng chọn đơn vị cơ sở' }]}
                    >
                        <Select 
                            placeholder={selectedDisplayUnit 
                                ? "Chọn đơn vị cơ sở có thể chuyển đổi" 
                                : "Vui lòng chọn đơn vị hiển thị trước"
                            }
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            disabled={!selectedDisplayUnit}
                        >
                            {convertibleBaseUnits.map(unit => (
                                <Option key={unit} value={unit}>
                                    {unit}
                                    {unit === selectedDisplayUnit && " (cùng đơn vị)"}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {activeTab === 'medicines' && (
                        <Form.Item
                            name="expirationDate"
                            label="Hạn sử dụng"
                            rules={[{ required: true, message: 'Vui lòng nhập hạn sử dụng' }]}
                        >
                            <Input type="date" />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="supplier"
                        label="Nhà cung cấp"
                        rules={[{ required: true, message: 'Vui lòng nhập nhà cung cấp' }]}
                    >
                        <Input placeholder="Nhập tên nhà cung cấp" />
                    </Form.Item>

                    <Form.Item
                        name="minStockLevelInBaseUnit"
                        label="Số lượng tối thiểu (đơn vị cơ sở)"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng tối thiểu theo đơn vị cơ sở' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="location"
                        label="Vị trí kho"
                    >
                        <Input placeholder="Nhập vị trí kho (mặc định: Kho chính)" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setShowAddModal(false);
                                setEditingRecord(null);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingRecord ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>



            {/* Request Detail Modal */}
            <Modal
                title="Chi tiết yêu cầu bổ sung"
                open={showRequestModal && selectedRequest}
                onCancel={() => {
                    setShowRequestModal(false);
                    setSelectedRequest(null);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setShowRequestModal(false);
                        setSelectedRequest(null);
                    }}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {selectedRequest && (
                    <div>
                        <Descriptions title="Thông tin yêu cầu" bordered size="small">
                            <Descriptions.Item label="ID" span={1}>{selectedRequest.id}</Descriptions.Item>
                            <Descriptions.Item label="Người yêu cầu" span={2}>
                                {selectedRequest.requestedByName || 'Không có thông tin'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày yêu cầu" span={1}>
                                {dayjs(selectedRequest.requestDate).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Độ ưu tiên" span={1}>
                                {selectedRequest.priority}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái" span={1}>
                                {selectedRequest.status}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lý do" span={3}>
                                {selectedRequest.reason || 'Không có lý do'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Typography.Title level={5}>
                            Danh sách vật tư ({selectedRequest.restockItems?.length || 0} mục)
                        </Typography.Title>
                        {selectedRequest.restockItems && selectedRequest.restockItems.length > 0 ? (
                            <Table
                                dataSource={selectedRequest.restockItems}
                                columns={[
                                    {
                                        title: 'Tên vật tư',
                                        dataIndex: 'medicalSupplyName',
                                        key: 'name',
                                    },
                                    {
                                        title: 'Loại',
                                        dataIndex: 'category',
                                        key: 'category',
                                        render: (category) => getCategoryTag(category),
                                    },
                                    {
                                        title: 'Tồn kho hiện tại',
                                        key: 'currentStock',
                                        render: (_, record) => {
                                            const displayQty = record.currentDisplayQuantity || 0;
                                            const displayUnit = record.currentDisplayUnit || 'unit';
                                            const stockBasein = record.currentStockInBaseUnit;
                                            const baseUnit = record.baseUnit || 'unit';
                                            return (
                                                <>
                                                    {displayQty} {displayUnit} 
                                                    <br />
                                                    <span style={{ color: 'gray', fontSize: '0.9em' }}>
                                                        ({stockBasein || 0} {baseUnit})
                                                    </span>
                                                </>
                                            );
                                        },
                                    },
                                    {
                                        title: 'Số lượng yêu cầu',
                                        key: 'requestedQuantity',
                                        render: (_, record) => {
                                            const requestedQty = record.requestedQuantityInBaseUnit || 0;
                                            const baseUnit = record.baseUnit || 'unit';
                                            return `${requestedQty} ${baseUnit}`;
                                        },
                                    },
                                    {
                                        title: 'Số lượng được duyệt',
                                        key: 'approvedQuantity',
                                        render: (_, record) => {
                                            // Get request status from parent (selectedRequest)
                                            const requestStatus = selectedRequest?.status;
                                            
                                            if (requestStatus === 'REJECTED') {
                                                return <Tag color="red">Từ chối</Tag>;
                                            } else if (requestStatus === 'APPROVED' || requestStatus === 'COMPLETED') {
                                                if (record.approvedQuantityInBaseUnit && record.baseUnit) {
                                                    return `${record.approvedQuantityInBaseUnit} ${record.baseUnit}`;
                                                } else {
                                                    // Approved but no specific quantity set, show requested quantity
                                                    const requestedQty = record.requestedQuantityInBaseUnit || 0;
                                                    const baseUnit = record.baseUnit || 'unit';
                                                    return `${requestedQty} ${baseUnit}`;
                                                }
                                            } else {
                                                return <Tag color="blue">Chưa duyệt</Tag>;
                                            }
                                        },
                                    },
                                    {
                                        title: 'Ghi chú',
                                        dataIndex: 'notes',
                                        key: 'notes',
                                        ellipsis: true,
                                    },
                                ]}
                                pagination={false}
                                rowKey="id"
                                size="small"
                            />
                        ) : (
                            <p>Không có vật tư nào trong yêu cầu này</p>
                        )}
                    </div>
                )}
            </Modal>

            {/* Approval Modal */}
            <Modal
                title="Duyệt yêu cầu bổ sung"
                open={showApprovalModal && selectedRequest}
                onCancel={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                }}
                footer={null}
                width={800}
            >
                {selectedRequest && (
                    <Form
                        layout="vertical"
                        onFinish={(values) => {
                            const approvedItems = selectedRequest.restockItems.map(item => ({
                                itemId: item.id,
                                approvedQuantity: values[`qty_${item.id}`] || 0,
                                unit: item.baseUnit || 'unit'
                            }));
                            handleApproveRequest(selectedRequest.id, approvedItems);
                        }}
                    >
                        <Typography.Title level={5}>
                            Yêu cầu từ: {selectedRequest.requestedByName}
                        </Typography.Title>
                        <Typography.Text>
                            Lý do: {selectedRequest.reason}
                        </Typography.Text>
                        
                        <Divider />
                        
                        <Typography.Title level={5}>Duyệt số lượng cho từng vật tư:</Typography.Title>
                        
                        {selectedRequest.restockItems?.map(item => (
                            <Row key={item.id} gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={8}>
                                    <strong>{item.medicalSupplyName}</strong>
                                    <br />
                                    <Typography.Text type="secondary">
                                        Tồn kho: {item.currentDisplayQuantity || 0} {item.currentDisplayUnit || 'unit'}
                                    </Typography.Text>
                                </Col>
                                <Col span={8}>
                                    <Typography.Text>
                                        Yêu cầu: {item.requestedQuantityInBaseUnit || 0} {item.baseUnit || 'unit'}
                                    </Typography.Text>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name={`qty_${item.id}`}
                                        label="Số lượng duyệt"
                                        initialValue={item.requestedQuantityInBaseUnit}
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số lượng' },
                                            { type: 'number', min: 0, message: 'Số lượng phải lớn hơn 0' }
                                        ]}
                                    >
                                        <InputNumber
                                            min={0}
                                            max={(item.requestedQuantityInBaseUnit || 0) * 2}
                                            style={{ width: '100%' }}
                                            addonAfter={item.baseUnit || 'unit'}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        ))}
                        
                        <Form.Item>
                            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                <Button onClick={() => {
                                    setShowApprovalModal(false);
                                    setSelectedRequest(null);
                                }}>
                                    Hủy
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Duyệt yêu cầu
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default InventorySection;