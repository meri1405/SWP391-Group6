import React, { useState } from 'react';
import {
    Tabs,
    Button,
    Card,
    Table,
    Tag,
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    Space,
    message,
    Row,
    Col
} from 'antd';
import {
    PlusOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const HealthChecksSection = () => {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('campaigns');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [messageApi, contextHolder] = message.useMessage();

    // Mock data for health check campaigns
    const [campaigns, setCampaigns] = useState([
        {
            id: 1,
            name: 'Kiểm tra sức khỏe đầu năm',
            plannedDate: '2024-02-15',
            checkItems: ['Chiều cao', 'Cân nặng', 'Thị lực', 'Răng miệng'],
            createdBy: 'Trần Văn A',
            status: 'upcoming'
        },
        {
            id: 2,
            name: 'Kiểm tra sức khỏe định kỳ',
            plannedDate: '2024-01-20',
            checkItems: ['Chiều cao', 'Cân nặng', 'Thị lực'],
            createdBy: 'Nguyễn Thị B',
            status: 'completed'
        }
    ]);

    // Mock data for health check results
    const [results, setResults] = useState([
        {
            id: 1,
            studentName: 'Lê Văn C',
            campaignName: 'Kiểm tra sức khỏe đầu năm',
            checkDate: '2024-02-15',
            resultSummary: 'Bình thường',
            adviceNotes: 'Cần tăng cường vận động',
            status: 'completed'
        },
        {
            id: 2,
            studentName: 'Phạm Thị D',
            campaignName: 'Kiểm tra sức khỏe định kỳ',
            checkDate: '2024-01-20',
            resultSummary: 'Cần theo dõi',
            adviceNotes: 'Cần khám chuyên khoa',
            status: 'pending'
        }
    ]);

    const getStatusTag = (status) => {
        const config = {
            upcoming: { color: 'blue', text: 'Sắp tới' },
            completed: { color: 'green', text: 'Đã hoàn thành' },
            cancelled: { color: 'red', text: 'Đã hủy' },
            pending: { color: 'orange', text: 'Đang chờ' }
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
    };

    const campaignColumns = [
        {
            title: 'Tên đợt kiểm tra',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Ngày dự kiến',
            dataIndex: 'plannedDate',
            key: 'plannedDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Các mục kiểm tra',
            dataIndex: 'checkItems',
            key: 'checkItems',
            render: (items) => (
                <Space direction="vertical">
                    {items.map((item, index) => (
                        <Tag key={index}>{item}</Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: 'Người tạo',
            dataIndex: 'createdBy',
            key: 'createdBy',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
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

    const resultColumns = [
        {
            title: 'Học sinh',
            dataIndex: 'studentName',
            key: 'studentName',
        },
        {
            title: 'Đợt kiểm tra',
            dataIndex: 'campaignName',
            key: 'campaignName',
        },
        {
            title: 'Ngày kiểm tra',
            dataIndex: 'checkDate',
            key: 'checkDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Kết quả',
            dataIndex: 'resultSummary',
            key: 'resultSummary',
        },
        {
            title: 'Lời khuyên',
            dataIndex: 'adviceNotes',
            key: 'adviceNotes',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
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
        const newRecord = {
            id: Date.now(),
            ...values,
            status: activeTab === 'campaigns' ? 'upcoming' : 'pending'
        };

        if (activeTab === 'campaigns') {
            setCampaigns([...campaigns, newRecord]);
        } else {
            setResults([...results, newRecord]);
        }

        messageApi.success('Thêm mới thành công');
        setShowAddModal(false);
        form.resetFields();
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
            plannedDate: record.plannedDate ? dayjs(record.plannedDate) : null,
            checkDate: record.checkDate ? dayjs(record.checkDate) : null
        });
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
                if (activeTab === 'campaigns') {
                    setCampaigns(campaigns.filter(item => item.id !== record.id));
                } else {
                    setResults(results.filter(item => item.id !== record.id));
                }
                messageApi.success('Xóa thành công');
            }
        });
    };

    const filteredData = activeTab === 'campaigns'
        ? campaigns.filter(campaign => {
            const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        : results.filter(result => {
            const matchesSearch = result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                result.campaignName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

    return (
        <div className="health-checks-section">
            {contextHolder}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        <TabPane
                            tab={
                                <span>
                                    <CalendarOutlined />
                                    Đợt kiểm tra ({campaigns.length})
                                </span>
                            }
                            key="campaigns"
                        />
                        <TabPane
                            tab={
                                <span>
                                    <CheckCircleOutlined />
                                    Kết quả ({results.length})
                                </span>
                            }
                            key="results"
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
                            value={statusFilter}
                            onChange={setStatusFilter}
                        >
                            <Option value="all">Tất cả trạng thái</Option>
                            <Option value="upcoming">Sắp tới</Option>
                            <Option value="completed">Đã hoàn thành</Option>
                            <Option value="cancelled">Đã hủy</Option>
                            <Option value="pending">Đang chờ</Option>
                        </Select>
                    </Col>
                </Row>

                {activeTab === 'campaigns' ? (
                    <Table
                        columns={campaignColumns}
                        dataSource={filteredData}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                ) : (
                    <Table
                        columns={resultColumns}
                        dataSource={filteredData}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                )}
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
                    {activeTab === 'campaigns' ? (
                        <>
                            <Form.Item
                                name="name"
                                label="Tên đợt kiểm tra"
                                rules={[{ required: true, message: 'Vui lòng nhập tên đợt kiểm tra' }]}
                            >
                                <Input placeholder="Nhập tên đợt kiểm tra" />
                            </Form.Item>

                            <Form.Item
                                name="plannedDate"
                                label="Ngày dự kiến"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày dự kiến' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>

                            <Form.Item
                                name="checkItems"
                                label="Các mục kiểm tra"
                                rules={[{ required: true, message: 'Vui lòng chọn các mục kiểm tra' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Chọn các mục kiểm tra"
                                    style={{ width: '100%' }}
                                >
                                    <Option value="Chiều cao">Chiều cao</Option>
                                    <Option value="Cân nặng">Cân nặng</Option>
                                    <Option value="Thị lực">Thị lực</Option>
                                    <Option value="Răng miệng">Răng miệng</Option>
                                    <Option value="Tim mạch">Tim mạch</Option>
                                    <Option value="Hô hấp">Hô hấp</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="createdBy"
                                label="Người tạo"
                                rules={[{ required: true, message: 'Vui lòng nhập tên người tạo' }]}
                            >
                                <Input placeholder="Nhập tên người tạo" />
                            </Form.Item>
                        </>
                    ) : (
                        <>
                            <Form.Item
                                name="studentName"
                                label="Học sinh"
                                rules={[{ required: true, message: 'Vui lòng nhập tên học sinh' }]}
                            >
                                <Input placeholder="Nhập tên học sinh" />
                            </Form.Item>

                            <Form.Item
                                name="campaignName"
                                label="Đợt kiểm tra"
                                rules={[{ required: true, message: 'Vui lòng chọn đợt kiểm tra' }]}
                            >
                                <Select placeholder="Chọn đợt kiểm tra">
                                    {campaigns.map(campaign => (
                                        <Option key={campaign.id} value={campaign.name}>
                                            {campaign.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="checkDate"
                                label="Ngày kiểm tra"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày kiểm tra' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>

                            <Form.Item
                                name="resultSummary"
                                label="Kết quả"
                                rules={[{ required: true, message: 'Vui lòng nhập kết quả' }]}
                            >
                                <Input placeholder="Nhập kết quả kiểm tra" />
                            </Form.Item>

                            <Form.Item
                                name="adviceNotes"
                                label="Lời khuyên"
                            >
                                <TextArea rows={4} placeholder="Nhập lời khuyên (nếu có)" />
                            </Form.Item>
                        </>
                    )}

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

export default HealthChecksSection; 