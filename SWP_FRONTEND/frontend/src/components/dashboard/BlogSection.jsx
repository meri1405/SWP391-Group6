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
    DatePicker,
    Upload
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    FileImageOutlined,
    EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const BlogSection = () => {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('published');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [messageApi, contextHolder] = message.useMessage();

    // Mock data for published posts
    const [publishedPosts, setPublishedPosts] = useState([
        {
            id: 1,
            title: 'Cách phòng chống dịch sốt xuất huyết',
            category: 'disease_prevention',
            content: 'Bài viết hướng dẫn các biện pháp phòng chống dịch sốt xuất huyết...',
            author: 'Bác sĩ Nguyễn Văn A',
            publishDate: '2024-01-15',
            status: 'published',
            imageUrl: 'https://example.com/image1.jpg'
        },
        {
            id: 2,
            title: 'Dinh dưỡng cho học sinh',
            category: 'nutrition',
            content: 'Bài viết về chế độ dinh dưỡng hợp lý cho học sinh...',
            author: 'Bác sĩ Trần Thị B',
            publishDate: '2024-01-10',
            status: 'published',
            imageUrl: 'https://example.com/image2.jpg'
        }
    ]);

    // Mock data for draft posts
    const [draftPosts, setDraftPosts] = useState([
        {
            id: 3,
            title: 'Vệ sinh cá nhân cho học sinh',
            category: 'hygiene',
            content: 'Bài viết hướng dẫn vệ sinh cá nhân cho học sinh...',
            author: 'Bác sĩ Lê Văn C',
            createdDate: '2024-01-18',
            status: 'draft',
            imageUrl: 'https://example.com/image3.jpg'
        }
    ]);

    const getCategoryTag = (category) => {
        const config = {
            disease_prevention: { color: 'red', text: 'Phòng bệnh' },
            nutrition: { color: 'green', text: 'Dinh dưỡng' },
            hygiene: { color: 'blue', text: 'Vệ sinh' },
            mental_health: { color: 'purple', text: 'Sức khỏe tâm thần' },
            other: { color: 'default', text: 'Khác' }
        };
        return <Tag color={config[category].color}>{config[category].text}</Tag>;
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (category) => getCategoryTag(category),
        },
        {
            title: 'Tác giả',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: activeTab === 'published' ? 'Ngày đăng' : 'Ngày tạo',
            dataIndex: activeTab === 'published' ? 'publishDate' : 'createdDate',
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
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handlePreview(record)}
                    >
                        Xem
                    </Button>
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
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handlePublish(record)}
                        >
                            Đăng
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const handleAdd = (values) => {
        const newPost = {
            id: Date.now(),
            ...values,
            status: 'draft',
            createdDate: dayjs().format('YYYY-MM-DD')
        };

        setDraftPosts([...draftPosts, newPost]);
        messageApi.success('Thêm bài viết mới thành công');
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
            content: 'Bạn có chắc chắn muốn xóa bài viết này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                if (activeTab === 'published') {
                    setPublishedPosts(publishedPosts.filter(item => item.id !== record.id));
                } else {
                    setDraftPosts(draftPosts.filter(item => item.id !== record.id));
                }
                messageApi.success('Xóa bài viết thành công');
            }
        });
    };

    const handlePublish = (record) => {
        Modal.confirm({
            title: 'Xác nhận đăng bài',
            content: 'Bạn có chắc chắn muốn đăng bài viết này?',
            okText: 'Đăng',
            okType: 'primary',
            cancelText: 'Hủy',
            onOk() {
                const publishedPost = {
                    ...record,
                    status: 'published',
                    publishDate: dayjs().format('YYYY-MM-DD')
                };
                setPublishedPosts([...publishedPosts, publishedPost]);
                setDraftPosts(draftPosts.filter(item => item.id !== record.id));
                messageApi.success('Đăng bài viết thành công');
            }
        });
    };

    const handlePreview = (record) => {
        Modal.info({
            title: record.title,
            width: 800,
            content: (
                <div>
                    <img src={record.imageUrl} alt={record.title} style={{ width: '100%', marginBottom: 16 }} />
                    <p><strong>Tác giả:</strong> {record.author}</p>
                    <p><strong>Danh mục:</strong> {getCategoryTag(record.category)}</p>
                    <p><strong>Ngày {activeTab === 'published' ? 'đăng' : 'tạo'}:</strong> {dayjs(activeTab === 'published' ? record.publishDate : record.createdDate).format('DD/MM/YYYY')}</p>
                    <div style={{ marginTop: 16 }}>
                        {record.content}
                    </div>
                </div>
            )
        });
    };

    const filteredData = activeTab === 'published'
        ? publishedPosts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        : draftPosts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

    return (
        <div className="blog-section">
            {contextHolder}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        <TabPane
                            tab={
                                <span>
                                    Đã đăng ({publishedPosts.length})
                                </span>
                            }
                            key="published"
                        />
                        <TabPane
                            tab={
                                <span>
                                    Bản nháp ({draftPosts.length})
                                </span>
                            }
                            key="drafts"
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
                            <Option value="all">Tất cả danh mục</Option>
                            <Option value="disease_prevention">Phòng bệnh</Option>
                            <Option value="nutrition">Dinh dưỡng</Option>
                            <Option value="hygiene">Vệ sinh</Option>
                            <Option value="mental_health">Sức khỏe tâm thần</Option>
                            <Option value="other">Khác</Option>
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
                title={editingRecord ? 'Sửa bài viết' : 'Thêm bài viết mới'}
                open={showAddModal}
                onCancel={() => {
                    setShowAddModal(false);
                    setEditingRecord(null);
                    form.resetFields();
                }}
                footer={null}
                width={800}
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
                        <Input placeholder="Nhập tiêu đề bài viết" />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Danh mục"
                        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                    >
                        <Select placeholder="Chọn danh mục">
                            <Option value="disease_prevention">Phòng bệnh</Option>
                            <Option value="nutrition">Dinh dưỡng</Option>
                            <Option value="hygiene">Vệ sinh</Option>
                            <Option value="mental_health">Sức khỏe tâm thần</Option>
                            <Option value="other">Khác</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="author"
                        label="Tác giả"
                        rules={[{ required: true, message: 'Vui lòng nhập tên tác giả' }]}
                    >
                        <Input placeholder="Nhập tên tác giả" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Nội dung"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                    >
                        <TextArea rows={6} placeholder="Nhập nội dung bài viết" />
                    </Form.Item>

                    <Form.Item
                        name="imageUrl"
                        label="Hình ảnh"
                        rules={[{ required: true, message: 'Vui lòng chọn hình ảnh' }]}
                    >
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Tải lên</div>
                            </div>
                        </Upload>
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

export default BlogSection; 