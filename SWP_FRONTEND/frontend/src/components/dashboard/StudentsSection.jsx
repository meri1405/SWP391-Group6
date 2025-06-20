import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, DatePicker, Select, Checkbox, Divider, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

const genderOptions = [
    { value: 'M', label: 'Nam' },
    { value: 'F', label: 'Nữ' },
    { value: 'O', label: 'Khác' },
];

const birthPlaceOptions = [
    "Thành phố Hà Nội",
    "Thành phố Huế",
    "Tỉnh Lai Châu",
    "Tỉnh Điện Biên",
    "Tỉnh Sơn La",
    "Tỉnh Lạng Sơn",
    "Tỉnh Quảng Ninh",
    "Tỉnh Thanh Hoá",
    "Tỉnh Nghệ An",
    "Tỉnh Hà Tĩnh",
    "Tỉnh Cao Bằng",
    "Tỉnh Tuyên Quang",
    "Tỉnh Lào Cai",
    "Tỉnh Thái Nguyên",
    "Tỉnh Phú Thọ",
    "Tỉnh Bắc Ninh",
    "Tỉnh Hưng Yên",
    "Thành phố Hải Phòng",
    "Tỉnh Ninh Bình",
    "Tỉnh Quảng Trị",
    "Thành phố Đà Nẵng",
    "Tỉnh Quảng Ngãi",
    "Tỉnh Gia Lai",
    "Tỉnh Khánh Hoà",
    "Tỉnh Lâm Đồng",
    "Tỉnh Đắk Lắk",
    "Thành phố Hồ Chí Minh",
    "Tỉnh Đồng Nai",
    "Tỉnh Tây Ninh",
    "Thành phố Cần Thơ",
    "Tỉnh Vĩnh Long",
    "Tỉnh Đồng Tháp",
    "Tỉnh Cà Mau",
    "Tỉnh An Giang"
];

// Vietnamese alphabet regex (upper/lower, spaces)
const vietnameseNameRegex = /^[a-zA-ZĂăÂâĐđÊêÔôƠơƯưÁáÀàẢảÃãẠạĂăẮắẰằẲẳẴẵẶặÂâẤấẦầẨẩẪẫẬậÉéÈèẺẻẼẽẸẹÊêẾếỀềỂểỄễỆệÍíÌìỈỉĨĩỊịÓóÒòỎỏÕõỌọÔôỐốỒồỔổỖỗỘộƠơỚớỜờỞởỠỡỢợÚúÙùỦủŨũỤụƯưỨứỪừỬửỮữỰựÝýỲỳỶỷỸỹỴỵ\s]+$/;

const StudentsSection = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [students, setStudents] = useState([
        { id: 1, name: 'Nguyễn Văn A', email: 'a@student.edu.vn', enrollmentDate: '2023-09-01' },
        { id: 2, name: 'Trần Thị B', email: 'b@student.edu.vn', enrollmentDate: '2022-08-15' },
        { id: 3, name: 'Lê Văn C', email: 'c@student.edu.vn', enrollmentDate: '2021-07-10' },
    ]);

    const columns = [
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Ngày nhập học', dataIndex: 'enrollmentDate', key: 'enrollmentDate' },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                </Space>
            ),
        },
    ];

    const handleAdd = (values) => {
        // For demo, just close modal and reset
        setShowAddModal(false);
        form.resetFields();
        message.success('Đã thêm học sinh và phụ huynh (giả lập)');
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        editForm.setFieldsValue({
            name: student.name,
            email: student.email,
            enrollmentDate: student.enrollmentDate,
        });
        setShowEditModal(true);
    };

    const handleEditSave = (values) => {
        setStudents((prev) => prev.map((s) => s.id === editingStudent.id ? { ...s, ...values } : s));
        setShowEditModal(false);
        setEditingStudent(null);
        message.success('Cập nhật thông tin học sinh thành công');
    };

    return (
        <div className="dashboard-section">
            <div className="section-header">
                <h2 style={{ fontSize: 24, fontWeight: 600, color: '#333', margin: 0 }}>Học sinh</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        form.resetFields();
                        setShowAddModal(true);
                    }}
                    style={{ background: '#ff6b35', borderColor: '#ff6b35', borderRadius: 6, fontWeight: 500 }}
                >
                    Thêm học sinh
                </Button>
            </div>
            <Card style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 24 }} bodyStyle={{ padding: 24 }}>
                <Table
                    columns={columns}
                    dataSource={students}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    style={{ borderRadius: 8, overflow: 'hidden' }}
                />
            </Card>
            <Modal
                title={'Thêm học sinh và phụ huynh'}
                open={showAddModal}
                onCancel={() => {
                    setShowAddModal(false);
                    form.resetFields();
                }}
                footer={null}
                width={900}
            >
                {/* Guide Section */}
                <Card style={{ marginBottom: 24, background: '#f6f8fa', borderLeft: '4px solid #ff6b35' }}>
                    <div style={{ fontWeight: 500, color: '#ff6b35', marginBottom: 8 }}>📋 Hướng dẫn nhập thông tin</div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: '#333', fontSize: 14 }}>
                        <li>Họ và tên: 2-50 ký tự, chỉ chữ cái tiếng Việt.</li>
                        <li>Số điện thoại: 10 số, bắt đầu bằng 03, 05, 07, 08, 09.</li>
                        <li>Ngày sinh phụ huynh: Tuổi từ 18-100.</li>
                        <li>Ngày sinh học sinh: Từ 6 đến 12 tuổi.</li>
                        <li>Địa chỉ: 10-200 ký tự.</li>
                        <li>Nơi sinh: Chọn từ danh sách tỉnh/thành phố.</li>
                        <li>Có thể thêm tối đa 2 phụ huynh và 5 học sinh.</li>
                    </ul>
                </Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAdd}
                    autoComplete="off"
                >
                    <Form.List name="parents" initialValue={[{}]} rules={[{ validator: async (_, parents) => { if (!parents || parents.length < 1) throw new Error('Ít nhất 1 phụ huynh'); if (parents.length > 2) throw new Error('Tối đa 2 phụ huynh'); } }]}
                    >
                        {(fields, { add, remove }) => (
                            <>
                                <Title level={5} style={{ marginTop: 0 }}>Thông tin phụ huynh</Title>
                                {fields.map((field, idx) => (
                                    <Card key={field.key} style={{ marginBottom: 16, borderRadius: 8, background: '#fafafa', position: 'relative' }}>
                                        {fields.length > 1 && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(field.name)}
                                                style={{ position: 'absolute', top: 8, right: 8 }}
                                            >
                                                Xóa phụ huynh
                                            </Button>
                                        )}
                                        <Form.Item
                                            name={[field.name, 'first_name']}
                                            label="Họ"
                                            rules={[{ required: true, message: 'Nhập họ' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                            extra="2-50 ký tự, chỉ chữ cái tiếng Việt."
                                        >
                                            <Input placeholder="Nhập họ" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'last_name']}
                                            label="Tên"
                                            rules={[{ required: true, message: 'Nhập tên' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                            extra="2-50 ký tự, chỉ chữ cái tiếng Việt."
                                        >
                                            <Input placeholder="Nhập tên" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'dob']}
                                            label="Ngày sinh"
                                            rules={[{
                                                validator: (_, value) => {
                                                    if (!value) return Promise.reject('Chọn ngày sinh');
                                                    const age = dayjs().diff(dayjs(value), 'year');
                                                    if (age < 18 || age > 100) return Promise.reject('Tuổi phụ huynh phải từ 18-100');
                                                    return Promise.resolve();
                                                }
                                            }]}
                                            extra="Tuổi từ 18-100."
                                        >
                                            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'gender']}
                                            label="Giới tính"
                                            rules={[{ required: true, message: 'Chọn giới tính' }]}
                                            extra="Bắt buộc."
                                        >
                                            <Select options={genderOptions} placeholder="Chọn giới tính" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'address']}
                                            label="Địa chỉ"
                                            rules={[{ required: true, message: 'Nhập địa chỉ' }, { min: 10, max: 200, message: '10-200 ký tự' }]}
                                            extra="10-200 ký tự."
                                        >
                                            <Input placeholder="Nhập địa chỉ" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'phone']}
                                            label="Số điện thoại"
                                            rules={[{ pattern: /^(03|05|07|08|09)\d{8}$/, message: 'Số điện thoại phải 10 số, bắt đầu bằng 03, 05, 07, 08, 09' }]}
                                            extra="10 số, bắt đầu bằng 03, 05, 07, 08, 09."
                                        >
                                            <Input placeholder="Nhập số điện thoại" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'job_title']}
                                            label="Nghề nghiệp"
                                            rules={[{ max: 255, message: 'Tối đa 255 ký tự' }]}
                                            extra="Tùy chọn. Tối đa 255 ký tự."
                                        >
                                            <Input placeholder="Nghề nghiệp (tùy chọn)" />
                                        </Form.Item>
                                        <Form.Item name={[field.name, 'roleid']} initialValue={3} hidden>
                                            <Input type="hidden" />
                                        </Form.Item>
                                    </Card>
                                ))}
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    icon={<PlusOutlined />}
                                    disabled={fields.length >= 2}
                                    style={{ width: '100%', marginBottom: 24 }}
                                >
                                    Thêm phụ huynh
                                </Button>
                            </>
                        )}
                    </Form.List>
                    <Divider />
                    <Form.List name="students" initialValue={[{}]} rules={[{ validator: async (_, students) => { if (!students || students.length < 1) throw new Error('Ít nhất 1 học sinh'); if (students.length > 5) throw new Error('Tối đa 5 học sinh'); } }]}
                    >
                        {(fields, { add, remove }) => (
                            <>
                                <Title level={5}>Thông tin học sinh</Title>
                                {fields.map((field, idx) => (
                                    <Card key={field.key} style={{ marginBottom: 16, borderRadius: 8, background: '#f6f8fa', position: 'relative' }}>
                                        {fields.length > 1 && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(field.name)}
                                                style={{ position: 'absolute', top: 8, right: 8 }}
                                            >
                                                Xóa học sinh
                                            </Button>
                                        )}
                                        <Form.Item
                                            name={[field.name, 'first_name']}
                                            label="Họ"
                                            rules={[{ required: true, message: 'Nhập họ' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                            extra="2-50 ký tự, chỉ chữ cái tiếng Việt."
                                        >
                                            <Input placeholder="Nhập họ" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'last_name']}
                                            label="Tên"
                                            rules={[{ required: true, message: 'Nhập tên' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                            extra="2-50 ký tự, chỉ chữ cái tiếng Việt."
                                        >
                                            <Input placeholder="Nhập tên" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'dob']}
                                            label="Ngày sinh"
                                            rules={[{
                                                validator: (_, value) => {
                                                    if (!value) return Promise.reject('Chọn ngày sinh');
                                                    const age = dayjs().diff(dayjs(value), 'year');
                                                    if (age < 6 || age > 12) return Promise.reject('Tuổi học sinh phải từ 6-12');
                                                    return Promise.resolve();
                                                }
                                            }]}
                                            extra="Từ 6 đến 12 tuổi."
                                        >
                                            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'birth_place']}
                                            label="Nơi sinh"
                                            extra="Chọn nơi sinh từ danh sách."
                                        >
                                            <Select placeholder="Chọn nơi sinh">
                                                {birthPlaceOptions.map((place) => (
                                                    <Option key={place} value={place}>{place}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'gender']}
                                            label="Giới tính"
                                            rules={[{ required: true, message: 'Chọn giới tính' }]}
                                            extra="Bắt buộc."
                                        >
                                            <Select options={genderOptions} placeholder="Chọn giới tính" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'citizenship']}
                                            label="Quốc tịch"
                                            initialValue="Việt Nam"
                                            extra="Mặc định là Việt Nam."
                                        >
                                            <Input placeholder="Quốc tịch" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'address']}
                                            label="Địa chỉ nhà"
                                            extra="Tùy chọn."
                                        >
                                            <Input placeholder="Địa chỉ nhà" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'class_name']}
                                            label="Lớp"
                                            rules={[{ required: true, message: 'Nhập lớp' }]}
                                            extra="Bắt buộc."
                                        >
                                            <Input placeholder="Lớp" />
                                        </Form.Item>
                                        <Form.Item
                                            name={[field.name, 'is_disabled']}
                                            valuePropName="checked"
                                            extra="Tùy chọn."
                                        >
                                            <Checkbox>Khuyết tật?</Checkbox>
                                        </Form.Item>
                                        <Form.Item name={[field.name, 'father_id']} hidden><Input type="hidden" /></Form.Item>
                                        <Form.Item name={[field.name, 'mother_id']} hidden><Input type="hidden" /></Form.Item>
                                    </Card>
                                ))}
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    icon={<PlusOutlined />}
                                    disabled={fields.length >= 5}
                                    style={{ width: '100%', marginBottom: 24 }}
                                >
                                    Thêm học sinh
                                </Button>
                            </>
                        )}
                    </Form.List>
                    <Divider />
                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setShowAddModal(false);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Thêm
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Sửa thông tin học sinh"
                open={showEditModal}
                onCancel={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                    editForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSave}
                    initialValues={editingStudent}
                >
                    <Form.Item
                        name="name"
                        label="Tên"
                        rules={[{ required: true, message: 'Nhập tên' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                        extra="2-50 ký tự, chỉ chữ cái tiếng Việt."
                    >
                        <Input placeholder="Nhập tên" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
                    >
                        <Input placeholder="Nhập email" />
                    </Form.Item>
                    <Form.Item
                        name="enrollmentDate"
                        label="Ngày nhập học"
                        rules={[{ required: true, message: 'Nhập ngày nhập học' }]}
                    >
                        <Input placeholder="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setShowEditModal(false);
                                setEditingStudent(null);
                                editForm.resetFields();
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

export default StudentsSection; 