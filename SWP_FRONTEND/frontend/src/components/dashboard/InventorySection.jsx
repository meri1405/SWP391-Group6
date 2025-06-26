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
    Divider,
    List,
    Checkbox
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
    const [messageApi, contextHolder] = message.useMessage();
    const [restockRequests, setRestockRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [supplies, setSupplies] = useState([]);

    const getStatusTag = (record) => {
        const quantity = record.quantity || 0;
        const minStockLevel = record.minStockLevel || 0;
        
        if (quantity <= minStockLevel) {
            return <Tag color="red" icon={<WarningOutlined />}>Sắp hết</Tag>;
        } else if (quantity <= minStockLevel * 1.5) {
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
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => `${quantity} ${record.unit}`,
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
                    {(record.quantity <= record.minStockLevel) && (
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
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => `${quantity} ${record.unit}`,
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
                    {(record.quantity <= record.minStockLevel) && (
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
                </Space>
            ),
        },
    ];

    const handleAdd = async (values) => {
        try {
            setLoading(true);
            
            // Map form values to API format
            const supplyData = {
                name: values.name,
                category: values.category,
                quantity: values.quantity,
                unit: values.unit,
                supplier: values.supplier,
                minStockLevel: values.minStockLevel,
                expiryDate: values.expirationDate, // Allow null for non-medicine items
                location: 'Kho chính', // Default location
                description: `${values.category} - ${values.name}`
            };

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
            form.resetFields();
        } catch (error) {
            console.error('Error saving supply:', error);
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
    const fetchRestockRequests = useCallback(async () => {
        try {
            setLoading(true);
            const requests = await restockRequestApi.getPendingRequests();
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
        // Load medical supplies on component mount
        fetchMedicalSupplies();
    }, [fetchMedicalSupplies]);

    useEffect(() => {
        if (activeTab === 'requests') {
            fetchRestockRequests();
        }
    }, [activeTab, fetchRestockRequests]);

    // Handle request approval
    const handleApproveRequest = async (requestId, approvedItems) => {
        try {
            const approvalData = {
                reviewerId: 1, // This should come from auth context
                reviewNotes: 'Approved by manager',
                itemApprovals: approvedItems
            };
            
            await restockRequestApi.approveRequestWithQuantities(requestId, approvalData);
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
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingRecord(null);
                                form.resetFields();
                                setShowAddModal(true);
                            }}
                            disabled={activeTab === 'requests'}
                        >
                            Thêm mới
                        </Button>
                    </Space>
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
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            disabled={activeTab === 'requests'}
                        >
                            <Option value="all">Tất cả loại</Option>
                            {activeTab === 'medicines' ? (
                                <>
                                    <Option value="painkiller">Giảm đau</Option>
                                    <Option value="antibiotic">Kháng sinh</Option>
                                    <Option value="vitamin">Vitamin</Option>
                                    <Option value="supplement">Thực phẩm bổ sung</Option>
                                </>
                            ) : activeTab === 'supplies' ? (
                                <>
                                    <Option value="bandage">Băng y tế</Option>
                                    <Option value="gloves">Găng tay</Option>
                                    <Option value="equipment">Thiết bị</Option>
                                    <Option value="antiseptic">Sát trung</Option>
                                    <Option value="medical_device">Thiết bị y tế</Option>
                                </>
                            ) : null}
                            <Option value="other">Khác</Option>
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
                        name="quantity"
                        label="Số lượng"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="unit"
                        label="Đơn vị"
                        rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
                    >
                        <Input placeholder="Nhập đơn vị (viên, hộp, cuộn,...)" />
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
                        name="minStockLevel"
                        label="Số lượng tối thiểu"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng tối thiểu' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
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
                                    },
                                    {
                                        title: 'Tồn kho hiện tại',
                                        dataIndex: 'currentStock',
                                        key: 'currentStock',
                                        render: (stock, record) => `${stock} ${record.unit}`,
                                    },
                                    {
                                        title: 'Số lượng yêu cầu',
                                        dataIndex: 'requestedQuantity',
                                        key: 'requestedQuantity',
                                        render: (qty, record) => `${qty} ${record.unit}`,
                                    },
                                    {
                                        title: 'Số lượng được duyệt',
                                        dataIndex: 'approvedQuantity',
                                        key: 'approvedQuantity',
                                        render: (qty, record) => qty ? `${qty} ${record.unit}` : 'Chưa duyệt',
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
                                approvedQuantity: values[`qty_${item.id}`] || 0
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
                                        Tồn kho: {item.currentStock} {item.unit}
                                    </Typography.Text>
                                </Col>
                                <Col span={8}>
                                    <Typography.Text>
                                        Yêu cầu: {item.requestedQuantity} {item.unit}
                                    </Typography.Text>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name={`qty_${item.id}`}
                                        label="Số lượng duyệt"
                                        initialValue={item.requestedQuantity}
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số lượng' },
                                            { type: 'number', min: 0, message: 'Số lượng phải lớn hơn 0' }
                                        ]}
                                    >
                                        <InputNumber
                                            min={0}
                                            max={item.requestedQuantity * 2}
                                            style={{ width: '100%' }}
                                            addonAfter={item.unit}
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