import React, { useState } from 'react';
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
    Tabs
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    WarningOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const InventorySection = () => {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('medicines');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [messageApi, contextHolder] = message.useMessage();

    // Mock data for medicines
    const [medicines, setMedicines] = useState([
        {
            id: 1,
            name: 'Paracetamol 500mg',
            category: 'painkiller',
            quantity: 100,
            unit: 'viên',
            expiryDate: '2024-12-31',
            supplier: 'Công ty Dược phẩm A',
            status: 'available',
            minQuantity: 20
        },
        {
            id: 2,
            name: 'Amoxicillin 500mg',
            category: 'antibiotic',
            quantity: 50,
            unit: 'viên',
            expiryDate: '2024-10-31',
            supplier: 'Công ty Dược phẩm B',
            status: 'low',
            minQuantity: 30
        }
    ]);

    // Mock data for supplies
    const [supplies, setSupplies] = useState([
        {
            id: 1,
            name: 'Băng y tế',
            category: 'bandage',
            quantity: 200,
            unit: 'cuộn',
            supplier: 'Công ty Thiết bị Y tế A',
            status: 'available',
            minQuantity: 50
        },
        {
            id: 2,
            name: 'Găng tay y tế',
            category: 'gloves',
            quantity: 1000,
            unit: 'đôi',
            supplier: 'Công ty Thiết bị Y tế B',
            status: 'low',
            minQuantity: 200
        }
    ]);

    const getStatusTag = (status, quantity, minQuantity) => {
        if (quantity <= minQuantity) {
            return <Tag color="red" icon={<WarningOutlined />}>Sắp hết</Tag>;
        }
        const config = {
            available: { color: 'green', text: 'Còn hàng' },
            out: { color: 'red', text: 'Hết hàng' },
            low: { color: 'orange', text: 'Sắp hết' }
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
    };

    const getCategoryTag = (category) => {
        const config = {
            painkiller: { color: 'blue', text: 'Giảm đau' },
            antibiotic: { color: 'purple', text: 'Kháng sinh' },
            bandage: { color: 'cyan', text: 'Băng y tế' },
            gloves: { color: 'green', text: 'Găng tay' },
            other: { color: 'default', text: 'Khác' }
        };
        return <Tag color={config[category].color}>{config[category].text}</Tag>;
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
            dataIndex: 'expiryDate',
            key: 'expiryDate',
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'supplier',
            key: 'supplier',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => getStatusTag(record.status, record.quantity, record.minQuantity),
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
            render: (_, record) => getStatusTag(record.status, record.quantity, record.minQuantity),
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
                </Space>
            ),
        },
    ];

    const handleAdd = (values) => {
        const newItem = {
            id: Date.now(),
            ...values,
            status: values.quantity <= values.minQuantity ? 'low' : 'available'
        };

        if (activeTab === 'medicines') {
            setMedicines([...medicines, newItem]);
        } else {
            setSupplies([...supplies, newItem]);
        }

        messageApi.success('Thêm mới thành công');
        setShowAddModal(false);
        form.resetFields();
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
            onOk() {
                if (activeTab === 'medicines') {
                    setMedicines(medicines.filter(item => item.id !== record.id));
                } else {
                    setSupplies(supplies.filter(item => item.id !== record.id));
                }
                messageApi.success('Xóa thành công');
            }
        });
    };

    const filteredData = activeTab === 'medicines'
        ? medicines.filter(medicine => {
            const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                medicine.supplier.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || medicine.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        : supplies.filter(supply => {
            const matchesSearch = supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supply.supplier.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || supply.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

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
                    </Tabs>
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
                </div>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Tìm kiếm..."
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            style={{ width: '100%' }}
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                        >
                            <Option value="all">Tất cả loại</Option>
                            {activeTab === 'medicines' ? (
                                <>
                                    <Option value="painkiller">Giảm đau</Option>
                                    <Option value="antibiotic">Kháng sinh</Option>
                                </>
                            ) : (
                                <>
                                    <Option value="bandage">Băng y tế</Option>
                                    <Option value="gloves">Găng tay</Option>
                                </>
                            )}
                            <Option value="other">Khác</Option>
                        </Select>
                    </Col>
                </Row>

                <Table
                    columns={activeTab === 'medicines' ? medicineColumns : supplyColumns}
                    dataSource={filteredData}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
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
                                </>
                            ) : (
                                <>
                                    <Option value="bandage">Băng y tế</Option>
                                    <Option value="gloves">Găng tay</Option>
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
                            name="expiryDate"
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
                        name="minQuantity"
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
        </div>
    );
};

export default InventorySection; 