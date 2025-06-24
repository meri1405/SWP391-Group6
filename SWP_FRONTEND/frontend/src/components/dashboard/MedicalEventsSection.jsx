import React, { useState } from 'react';
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    Space,
    Tag,
    message,
    Row,
    Col
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const MedicalEventsSection = () => {
    const [form] = Form.useForm();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [messageApi, contextHolder] = message.useMessage();

    // Mock data for medical events
    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Khám sức khỏe định kỳ',
            type: 'checkup',
            startDate: '2024-02-15',
            endDate: '2024-02-20',
            location: 'Phòng Y tế',
            description: 'Khám sức khỏe định kỳ cho toàn bộ học sinh',
            status: 'upcoming',
            priority: 'high'
        },
        {
            id: 2,
            title: 'Tiêm chủng mở rộng',
            type: 'vaccination',
            startDate: '2024-01-20',
            endDate: '2024-01-25',
            location: 'Phòng Y tế',
            description: 'Tiêm chủng các loại vaccine theo lịch',
            status: 'completed',
            priority: 'high'
        }
    ]);

    const getStatusTag = (status) => {
        const config = {
            upcoming: { color: 'blue', text: 'Sắp tới' },
            ongoing: { color: 'green', text: 'Đang diễn ra' },
            completed: { color: 'green', text: 'Đã hoàn thành' },
            cancelled: { color: 'red', text: 'Đã hủy' }
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
    };

    const getPriorityTag = (priority) => {
        const config = {
            high: { color: 'red', text: 'Cao' },
            medium: { color: 'orange', text: 'Trung bình' },
            low: { color: 'green', text: 'Thấp' }
        };
        return <Tag color={config[priority].color}>{config[priority].text}</Tag>;
    };

    const getTypeTag = (type) => {
        const config = {
            checkup: { color: 'blue', text: 'Khám sức khỏe' },
            vaccination: { color: 'purple', text: 'Tiêm chủng' },
            emergency: { color: 'red', text: 'Cấp cứu' },
            other: { color: 'default', text: 'Khác' }
        };
        return <Tag color={config[type].color}>{config[type].text}</Tag>;
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Loại sự kiện',
            dataIndex: 'type',
            key: 'type',
            render: (type) => getTypeTag(type),
        },
        {
            title: 'Thời gian',
            key: 'time',
            render: (_, record) => (
                <span>
                    {dayjs(record.startDate).format('DD/MM/YYYY')} - {dayjs(record.endDate).format('DD/MM/YYYY')}
                </span>
            ),
        },
        {
            title: 'Địa điểm',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Độ ưu tiên',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => getPriorityTag(priority),
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
        const newEvent = {
            id: Date.now(),
            ...values,
            startDate: values.dateRange[0].format('YYYY-MM-DD'),
            endDate: values.dateRange[1].format('YYYY-MM-DD')
        };
        delete newEvent.dateRange;

        setEvents([...events, newEvent]);
        messageApi.success('Thêm sự kiện thành công');
        setShowAddModal(false);
        form.resetFields();
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
            dateRange: [dayjs(record.startDate), dayjs(record.endDate)]
        });
        setShowAddModal(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa sự kiện này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                setEvents(events.filter(item => item.id !== record.id));
                messageApi.success('Xóa sự kiện thành công');
            }
        });
    };

    const filteredData = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="medical-events-section">
            {contextHolder}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2>Quản lý sự kiện y tế</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingRecord(null);
                            form.resetFields();
                            setShowAddModal(true);
                        }}
                    >
                        Thêm sự kiện
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
                            <Option value="ongoing">Đang diễn ra</Option>
                            <Option value="completed">Đã hoàn thành</Option>
                            <Option value="cancelled">Đã hủy</Option>
                        </Select>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingRecord ? 'Sửa sự kiện' : 'Thêm sự kiện mới'}
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
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input placeholder="Nhập tiêu đề sự kiện" />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Loại sự kiện"
                        rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện' }]}
                    >
                        <Select placeholder="Chọn loại sự kiện">
                            <Option value="checkup">Khám sức khỏe</Option>
                            <Option value="vaccination">Tiêm chủng</Option>
                            <Option value="emergency">Cấp cứu</Option>
                            <Option value="other">Khác</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                    >
                        <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item
                        name="location"
                        label="Địa điểm"
                        rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
                    >
                        <Input placeholder="Nhập địa điểm" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <TextArea rows={4} placeholder="Nhập mô tả sự kiện" />
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Độ ưu tiên"
                        rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
                    >
                        <Select placeholder="Chọn độ ưu tiên">
                            <Option value="high">Cao</Option>
                            <Option value="medium">Trung bình</Option>
                            <Option value="low">Thấp</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Option value="upcoming">Sắp tới</Option>
                            <Option value="ongoing">Đang diễn ra</Option>
                            <Option value="completed">Đã hoàn thành</Option>
                            <Option value="cancelled">Đã hủy</Option>
                        </Select>
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

export default MedicalEventsSection; 