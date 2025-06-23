import React, { useState } from 'react';
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Space,
    Tag,
    message,
    Row,
    Col,
    Tabs,
    DatePicker
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    BellOutlined,
    SendOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const NotificationsSection = () => {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('sent');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [messageApi, contextHolder] = message.useMessage();

    // Mock data for sent notifications
    const [sentNotifications, setSentNotifications] = useState([
        {
            id: 1,
            title: 'Thông báo khám sức khỏe định kỳ',
            type: 'health_check',
            content: 'Nhà trường sẽ tổ chức khám sức khỏe định kỳ cho học sinh vào ngày 15/02/2024',
            recipients: 'all_students',
            sentDate: '2024-01-15',
            status: 'sent'
        },
        {
            id: 2,
            title: 'Thông báo tiêm chủng',
            type: 'vaccination',
            content: 'Lịch tiêm chủng mở rộng sẽ được tổ chức vào ngày 20/01/2024',
            recipients: 'selected_students',
            sentDate: '2024-01-10',
            status: 'sent'
        }
    ]);

    // Mock data for draft notifications
    const [draftNotifications, setDraftNotifications] = useState([
        {
            id: 3,
            title: 'Thông báo về dịch bệnh',
            type: 'health_alert',
            content: 'Cảnh báo về dịch sốt xuất huyết đang bùng phát',
            recipients: 'all_students',
            createdDate: '2024-01-18',
            status: 'draft'
        }
    ]);

    const getTypeTag = (type) => {
        const config = {
            health_check: { color: 'blue', text: 'Khám sức khỏe' },
            vaccination: { color: 'purple', text: 'Tiêm chủng' },
            health_alert: { color: 'red', text: 'Cảnh báo y tế' },
            other: { color: 'default', text: 'Khác' }
        };
        return <Tag color={config[type].color}>{config[type].text}</Tag>;
    };

    const getRecipientsTag = (recipients) => {
        const config = {
            all_students: { color: 'green', text: 'Tất cả học sinh' },
            selected_students: { color: 'orange', text: 'Học sinh được chọn' },
            parents: { color: 'blue', text: 'Phụ huynh' },
            staff: { color: 'purple', text: 'Nhân viên' }
        };
        return <Tag color={config[recipients].color}>{config[recipients].text}</Tag>;
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => getTypeTag(type),
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
        },
        {
            title: 'Người nhận',
            dataIndex: 'recipients',
            key: 'recipients',
            render: (recipients) => getRecipientsTag(recipients),
        },
        {
            title: activeTab === 'sent' ? 'Ngày gửi' : 'Ngày tạo',
            dataIndex: activeTab === 'sent' ? 'sentDate' : 'createdDate',
            key: 'date',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
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
                    {activeTab === 'drafts' && (
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            size="small"
                            onClick={() => handleSend(record)}
                        >
                            Gửi
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const handleAdd = (values) => {
        const newNotification = {
            id: Date.now(),
            ...values,
            status: 'draft',
            createdDate: dayjs().format('YYYY-MM-DD')
        };

        setDraftNotifications([...draftNotifications, newNotification]);
        messageApi.success('Thêm thông báo mới thành công');
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
            content: 'Bạn có chắc chắn muốn xóa thông báo này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                if (activeTab === 'sent') {
                    setSentNotifications(sentNotifications.filter(item => item.id !== record.id));
                } else {
                    setDraftNotifications(draftNotifications.filter(item => item.id !== record.id));
                }
                messageApi.success('Xóa thông báo thành công');
            }
        });
    };

    const handleSend = (record) => {
        Modal.confirm({
            title: 'Xác nhận gửi',
            content: 'Bạn có chắc chắn muốn gửi thông báo này?',
            okText: 'Gửi',
            okType: 'primary',
            cancelText: 'Hủy',
            onOk() {
                const sentNotification = {
                    ...record,
                    status: 'sent',
                    sentDate: dayjs().format('YYYY-MM-DD')
                };
                setSentNotifications([...sentNotifications, sentNotification]);
                setDraftNotifications(draftNotifications.filter(item => item.id !== record.id));
                messageApi.success('Gửi thông báo thành công');
            }
        });
    };

    const filteredData = activeTab === 'sent'
        ? sentNotifications.filter(notification => {
            const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || notification.type === typeFilter;
            return matchesSearch && matchesType;
        })
        : draftNotifications.filter(notification => {
            const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || notification.type === typeFilter;
            return matchesSearch && matchesType;
        });

    return (
        <div className="dashboard-section">
            <div className="section-header">
                <h2 style={{ fontSize: 24, fontWeight: 600, color: '#333', margin: 0 }}>Thông báo</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingRecord(null);
                        form.resetFields();
                        setShowAddModal(true);
                    }}
                    style={{ background: '#ff6b35', borderColor: '#ff6b35', borderRadius: 6, fontWeight: 500 }}
                >
                    Thêm mới
                </Button>
            </div>
            <Card style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 24 }} bodyStyle={{ padding: 24 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }}>
                    <TabPane
                        tab={
                            <span>
                                <BellOutlined /> Đã gửi ({sentNotifications.length})
                            </span>
                        }
                        key="sent"
                    />
                    <TabPane
                        tab={
                            <span>
                                <EditOutlined /> Bản nháp ({draftNotifications.length})
                            </span>
                        }
                        key="drafts"
                    />
                </Tabs>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                    <Input
                        placeholder="Tìm kiếm..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ maxWidth: 300, borderRadius: 6 }}
                    />
                    <Select
                        style={{ minWidth: 180, borderRadius: 6 }}
                        value={typeFilter}
                        onChange={setTypeFilter}
                    >
                        <Option value="all">Tất cả loại</Option>
                        <Option value="health_check">Khám sức khỏe</Option>
                        <Option value="vaccination">Tiêm chủng</Option>
                        <Option value="health_alert">Cảnh báo y tế</Option>
                        <Option value="other">Khác</Option>
                    </Select>
                </div>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    style={{ borderRadius: 8, overflow: 'hidden' }}
                />
            </Card>

            <Modal
                title={editingRecord ? 'Sửa thông báo' : 'Thêm thông báo mới'}
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
                        <Input placeholder="Nhập tiêu đề thông báo" />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Loại thông báo"
                        rules={[{ required: true, message: 'Vui lòng chọn loại thông báo' }]}
                    >
                        <Select placeholder="Chọn loại thông báo">
                            <Option value="health_check">Khám sức khỏe</Option>
                            <Option value="vaccination">Tiêm chủng</Option>
                            <Option value="health_alert">Cảnh báo y tế</Option>
                            <Option value="other">Khác</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Nội dung"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    >
                        <TextArea rows={4} placeholder="Nhập nội dung thông báo" />
                    </Form.Item>

                    <Form.Item
                        name="recipients"
                        label="Người nhận"
                        rules={[{ required: true, message: 'Vui lòng chọn người nhận' }]}
                    >
                        <Select placeholder="Chọn người nhận">
                            <Option value="all_students">Tất cả học sinh</Option>
                            <Option value="selected_students">Học sinh được chọn</Option>
                            <Option value="parents">Phụ huynh</Option>
                            <Option value="staff">Nhân viên</Option>
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
                                {editingRecord ? 'Cập nhật' : 'Lưu nháp'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NotificationsSection; 