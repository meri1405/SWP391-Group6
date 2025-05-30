import React, { useState } from 'react';
import {
    Table,
    Button,
    Input,
    Select,
    Modal,
    Form,
    Space,
    Tag,
    Card,
    Row,
    Col
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const { Option } = Select;

const ConsultationsSection = () => {
    const [form] = Form.useForm();
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Mock data for consultations
    const [consultations] = useState([
        {
            id: 1,
            student: 'Nguyễn Văn A',
            parent: 'Nguyễn Văn B',
            manager: 'Trần Thị C',
            scheduledDate: '2024-03-20 09:00',
            reason: 'Tư vấn về chế độ dinh dưỡng',
            status: 'scheduled'
        },
        {
            id: 2,
            student: 'Lê Văn D',
            parent: 'Lê Thị E',
            manager: 'Phạm Văn F',
            scheduledDate: '2024-03-19 14:30',
            reason: 'Tư vấn về sức khỏe tâm lý',
            status: 'completed'
        }
    ]);

    const getStatusTag = (status) => {
        const statusConfig = {
            scheduled: { color: 'blue', text: 'Đã lên lịch' },
            completed: { color: 'green', text: 'Đã hoàn thành' },
            cancelled: { color: 'red', text: 'Đã hủy' }
        };

        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Học sinh',
            dataIndex: 'student',
            key: 'student',
        },
        {
            title: 'Phụ huynh',
            dataIndex: 'parent',
            key: 'parent',
        },
        {
            title: 'Người tư vấn',
            dataIndex: 'manager',
            key: 'manager',
        },
        {
            title: 'Ngày giờ',
            dataIndex: 'scheduledDate',
            key: 'scheduledDate',
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
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
                    >
                        Sửa
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    const filteredConsultations = consultations.filter(consultation => {
        const matchesSearch =
            consultation.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consultation.parent.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consultation.reason.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleAddConsultation = (values) => {
        console.log('Adding consultation:', values);
        setShowAddModal(false);
        form.resetFields();
    };

    return (
        <div className="consultations-section">
            <Card>
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
                            <Option value="scheduled">Đã lên lịch</Option>
                            <Option value="completed">Đã hoàn thành</Option>
                            <Option value="cancelled">Đã hủy</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setShowAddModal(true)}
                        >
                            Thêm lịch tư vấn
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredConsultations}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Thêm lịch tư vấn mới"
                open={showAddModal}
                onCancel={() => {
                    setShowAddModal(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddConsultation}
                >
                    <Form.Item
                        name="student"
                        label="Học sinh"
                        rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
                    >
                        <Select placeholder="Chọn học sinh">
                            {/* Add student options */}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="parent"
                        label="Phụ huynh"
                        rules={[{ required: true, message: 'Vui lòng chọn phụ huynh' }]}
                    >
                        <Select placeholder="Chọn phụ huynh">
                            {/* Add parent options */}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="manager"
                        label="Người tư vấn"
                        rules={[{ required: true, message: 'Vui lòng chọn người tư vấn' }]}
                    >
                        <Select placeholder="Chọn người tư vấn">
                            {/* Add manager options */}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="scheduledDate"
                        label="Ngày giờ"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày giờ' }]}
                    >
                        <Input type="datetime-local" />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Lý do"
                        rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Nhập lý do tư vấn" />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Ghi chú"
                    >
                        <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setShowAddModal(false);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Lưu
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ConsultationsSection; 