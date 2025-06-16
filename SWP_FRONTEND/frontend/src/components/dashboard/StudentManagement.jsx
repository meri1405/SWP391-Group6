import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Select, Button, Card, message, Modal, Table, Space, AutoComplete, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosInstance from '../../utils/axios';
import { API_BASE_URL } from '../../config';

const { Option } = Select;

const StudentManagement = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [parentForms, setParentForms] = useState([{ id: 1 }]);
    const [studentForms, setStudentForms] = useState([{ id: 1 }]);
    const [students, setStudents] = useState([]);
    const [parents, setParents] = useState([]);
    const [fatherOptions, setFatherOptions] = useState([]);
    const [motherOptions, setMotherOptions] = useState([]);

    useEffect(() => {
        fetchStudents();
        fetchParents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/manager/students');
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                // You might want to redirect to login page here
            } else {
                message.error('Có lỗi xảy ra khi tải danh sách học sinh!');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchParents = async () => {
        try {
            const response = await axiosInstance.get('/manager/parents');
            setParents(response.data);

            // Create options for father and mother dropdowns
            const options = response.data.map(parent => ({
                value: parent.id,
                label: `${parent.lastName} ${parent.firstName} (${parent.email})`,
                parent
            }));

            setFatherOptions(options);
            setMotherOptions(options);
        } catch (error) {
            console.error('Error fetching parents:', error);
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                // You might want to redirect to login page here
            } else {
                message.error('Có lỗi xảy ra khi tải danh sách phụ huynh!');
            }
        }
    };

    const addParentForm = () => {
        setParentForms([...parentForms, { id: parentForms.length + 1 }]);
    };

    const removeParentForm = (id) => {
        setParentForms(parentForms.filter(form => form.id !== id));
    };

    const addStudentForm = () => {
        setStudentForms([...studentForms, { id: studentForms.length + 1 }]);
    };

    const removeStudentForm = (id) => {
        setStudentForms(studentForms.filter(form => form.id !== id));
    };

    const showModal = (student = null) => {
        setEditingStudent(student);
        if (student) {
            form.setFieldsValue({
                ...student,
                dob: dayjs(student.dob),
            });
        } else {
            form.resetFields();
        }
        setModalVisible(true);
    };

    const handleCancel = () => {
        setModalVisible(false);
        setEditingStudent(null);
        form.resetFields();
        setParentForms([{ id: 1 }]);
        setStudentForms([{ id: 1 }]);
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            // First, create parent users
            const parentPromises = values.parents.map(async (parent) => {
                const parentData = {
                    firstName: parent.firstName,
                    lastName: parent.lastName,
                    email: parent.email,
                    phone: parent.phone,
                    address: parent.address,
                    role: 'PARENT',
                    status: 'ACTIVE',
                    password: Math.random().toString(36).slice(-8),
                    username: parent.email,
                    enabled: true,
                    jobTitle: 'Parent'
                };

                try {
                    const response = await axiosInstance.post('/manager/parents', parentData);
                    return response.data;
                } catch (error) {
                    console.error('Error creating parent:', error);
                    throw error;
                }
            });

            const createdParents = await Promise.all(parentPromises);

            // Then, create students and link them to parents
            const studentPromises = values.students.map(async (student) => {
                const studentData = {
                    firstName: student.firstName,
                    lastName: student.lastName,
                    dob: student.dateOfBirth.format('YYYY-MM-DD'),
                    class_name: student.className,
                    address: student.address,
                    birth_place: student.birthPlace,
                    citizenship: student.citizenship,
                    bloodType: 'A+', // Default blood type
                    isDisabled: false,
                    fatherId: createdParents[0]?.id, // Link to first parent as father
                    motherId: createdParents[1]?.id  // Link to second parent as mother if exists
                };

                try {
                    if (editingStudent) {
                        const response = await axiosInstance.put(`/manager/students/${editingStudent.studentid}`, studentData);
                        return response.data;
                    } else {
                        const response = await axiosInstance.post('/manager/students', studentData);
                        return response.data;
                    }
                } catch (error) {
                    console.error('Error creating/updating student:', error);
                    throw error;
                }
            });

            await Promise.all(studentPromises);

            message.success(editingStudent ? 'Cập nhật thông tin thành công!' : 'Thêm mới thành công!');
            setModalVisible(false);
            setEditingStudent(null);
            form.resetFields();
            setParentForms([{ id: 1 }]);
            setStudentForms([{ id: 1 }]);
            fetchStudents();
        } catch (error) {
            console.error('Error:', error);
            message.error(error.message || 'Có lỗi xảy ra khi lưu thông tin!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (studentId) => {
        try {
            await axiosInstance.delete(`/manager/students/${studentId}`);
            message.success('Xóa học sinh thành công!');
            fetchStudents();
        } catch (error) {
            message.error('Có lỗi xảy ra khi xóa học sinh!');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'studentid',
            key: 'studentid',
        },
        {
            title: 'Họ và tên',
            key: 'name',
            render: (_, record) => `${record.last_name} ${record.first_name}`,
        },
        {
            title: 'Lớp',
            dataIndex: 'class_name',
            key: 'class_name',
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dob',
            key: 'dob',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            render: (gender) => {
                switch (gender) {
                    case 'M': return 'Nam';
                    case 'F': return 'Nữ';
                    default: return 'Khác';
                }
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.studentid)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="student-management">
            <div className="section-header">
                <h2>Quản lý học sinh</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                    style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
                >
                    Thêm học sinh mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={students}
                rowKey="studentid"
                loading={loading}
                style={{ marginTop: 16 }}
            />

            <Modal
                title={editingStudent ? "Sửa thông tin học sinh" : "Thêm học sinh mới"}
                open={modalVisible}
                onCancel={handleCancel}
                footer={null}
                width={1000}
            >
                <div className="guide-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <h3 style={{ marginBottom: '10px', color: '#ff6b35' }}>Hướng dẫn nhập thông tin</h3>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        <li>Họ và tên: Chỉ được nhập chữ cái, không có ký tự đặc biệt và số</li>
                        <li>Ngày sinh: Phải hợp lệ, học sinh từ 4-18 tuổi</li>
                        <li>Tên lớp: Theo định dạng Số + Chữ cái (ví dụ: 1A, 2B)</li>
                        <li>Địa chỉ: Không được để trống</li>
                        <li>Nơi sinh: Chọn từ danh sách tỉnh/thành phố</li>
                        <li>Quốc tịch: Mặc định là Việt Nam</li>
                    </ul>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        citizenship: 'Việt Nam'
                    }}
                >
                    {parentForms.map((parentForm, index) => (
                        <div key={parentForm.id} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, color: '#ff6b35' }}>Thông tin phụ huynh {index + 1}</h3>
                                {parentForms.length > 1 && (
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeParentForm(parentForm.id)}
                                    >
                                        Xóa
                                    </Button>
                                )}
                            </div>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['parents', index, 'firstName']}
                                        label="Họ"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập họ!' },
                                            { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Họ chỉ được chứa chữ cái!' }
                                        ]}
                                    >
                                        <Input placeholder="Nhập họ" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['parents', index, 'lastName']}
                                        label="Tên"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tên!' },
                                            { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Tên chỉ được chứa chữ cái!' }
                                        ]}
                                    >
                                        <Input placeholder="Nhập tên" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['parents', index, 'phone']}
                                        label="Số điện thoại"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số!' }
                                        ]}
                                    >
                                        <Input placeholder="Nhập số điện thoại" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['parents', index, 'email']}
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' },
                                            { type: 'email', message: 'Email không hợp lệ!' }
                                        ]}
                                    >
                                        <Input placeholder="Nhập email" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name={['parents', index, 'address']}
                                        label="Địa chỉ"
                                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                                    >
                                        <Input placeholder="Nhập địa chỉ" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    ))}

                    <Button
                        type="dashed"
                        onClick={addParentForm}
                        style={{ width: '100%', marginBottom: '20px' }}
                        icon={<PlusOutlined />}
                    >
                        Thêm phụ huynh
                    </Button>

                    {studentForms.map((studentForm, index) => (
                        <div key={studentForm.id} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, color: '#ff6b35' }}>Thông tin học sinh {index + 1}</h3>
                                {studentForms.length > 1 && (
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeStudentForm(studentForm.id)}
                                    >
                                        Xóa
                                    </Button>
                                )}
                            </div>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['students', index, 'firstName']}
                                        label="Họ"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập họ!' },
                                            { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Họ chỉ được chứa chữ cái!' }
                                        ]}
                                    >
                                        <Input placeholder="Nhập họ" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['students', index, 'lastName']}
                                        label="Tên"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tên!' },
                                            { pattern: /^[a-zA-ZÀ-ỹ\s]+$/, message: 'Tên chỉ được chứa chữ cái!' }
                                        ]}
                                    >
                                        <Input placeholder="Nhập tên" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['students', index, 'dateOfBirth']}
                                        label="Ngày sinh"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn ngày sinh!' },
                                            {
                                                validator: (_, value) => {
                                                    if (!value) return Promise.resolve();
                                                    const age = dayjs().diff(value, 'year');
                                                    if (age < 4 || age > 18) {
                                                        return Promise.reject('Học sinh phải từ 4-18 tuổi!');
                                                    }
                                                    return Promise.resolve();
                                                },
                                            },
                                        ]}
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="DD/MM/YYYY"
                                            placeholder="Chọn ngày sinh"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['students', index, 'className']}
                                        label="Tên lớp"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập tên lớp!' },
                                            { pattern: /^\d+[A-Z]$/, message: 'Tên lớp phải theo định dạng: Số + Chữ cái (ví dụ: 1A)' }
                                        ]}
                                    >
                                        <Input placeholder="Nhập tên lớp (ví dụ: 1A)" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['students', index, 'address']}
                                        label="Địa chỉ"
                                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                                    >
                                        <Input placeholder="Nhập địa chỉ" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['students', index, 'birthPlace']}
                                        label="Nơi sinh"
                                        rules={[{ required: true, message: 'Vui lòng chọn nơi sinh!' }]}
                                    >
                                        <Select placeholder="Chọn nơi sinh">
                                            <Option value="Thành phố Hà Nội">Thành phố Hà Nội</Option>
                                            <Option value="Thành phố Huế">Thành phố Huế</Option>
                                            <Option value="Thành phố Đà Nẵng">Thành phố Đà Nẵng</Option>
                                            <Option value="Thành phố Hồ Chí Minh">Thành phố Hồ Chí Minh</Option>
                                            <Option value="Thành phố Cần Thơ">Thành phố Cần Thơ</Option>
                                            <Option value="Tỉnh Hà Giang">Tỉnh Hà Giang</Option>
                                            <Option value="Tỉnh Cao Bằng">Tỉnh Cao Bằng</Option>
                                            <Option value="Tỉnh Bắc Kạn">Tỉnh Bắc Kạn</Option>
                                            <Option value="Tỉnh Tuyên Quang">Tỉnh Tuyên Quang</Option>
                                            <Option value="Tỉnh Lào Cai">Tỉnh Lào Cai</Option>
                                            <Option value="Tỉnh Điện Biên">Tỉnh Điện Biên</Option>
                                            <Option value="Tỉnh Lai Châu">Tỉnh Lai Châu</Option>
                                            <Option value="Tỉnh Sơn La">Tỉnh Sơn La</Option>
                                            <Option value="Tỉnh Yên Bái">Tỉnh Yên Bái</Option>
                                            <Option value="Tỉnh Lạng Sơn">Tỉnh Lạng Sơn</Option>
                                            <Option value="Tỉnh Quảng Ninh">Tỉnh Quảng Ninh</Option>
                                            <Option value="Tỉnh Bắc Giang">Tỉnh Bắc Giang</Option>
                                            <Option value="Tỉnh Phú Thọ">Tỉnh Phú Thọ</Option>
                                            <Option value="Tỉnh Vĩnh Phúc">Tỉnh Vĩnh Phúc</Option>
                                            <Option value="Tỉnh Bắc Ninh">Tỉnh Bắc Ninh</Option>
                                            <Option value="Tỉnh Hải Dương">Tỉnh Hải Dương</Option>
                                            <Option value="Tỉnh Hải Phòng">Tỉnh Hải Phòng</Option>
                                            <Option value="Tỉnh Hưng Yên">Tỉnh Hưng Yên</Option>
                                            <Option value="Tỉnh Thái Bình">Tỉnh Thái Bình</Option>
                                            <Option value="Tỉnh Hà Nam">Tỉnh Hà Nam</Option>
                                            <Option value="Tỉnh Nam Định">Tỉnh Nam Định</Option>
                                            <Option value="Tỉnh Ninh Bình">Tỉnh Ninh Bình</Option>
                                            <Option value="Tỉnh Thanh Hóa">Tỉnh Thanh Hóa</Option>
                                            <Option value="Tỉnh Nghệ An">Tỉnh Nghệ An</Option>
                                            <Option value="Tỉnh Hà Tĩnh">Tỉnh Hà Tĩnh</Option>
                                            <Option value="Tỉnh Quảng Bình">Tỉnh Quảng Bình</Option>
                                            <Option value="Tỉnh Quảng Trị">Tỉnh Quảng Trị</Option>
                                            <Option value="Tỉnh Thừa Thiên Huế">Tỉnh Thừa Thiên Huế</Option>
                                            <Option value="Tỉnh Quảng Nam">Tỉnh Quảng Nam</Option>
                                            <Option value="Tỉnh Quảng Ngãi">Tỉnh Quảng Ngãi</Option>
                                            <Option value="Tỉnh Bình Định">Tỉnh Bình Định</Option>
                                            <Option value="Tỉnh Phú Yên">Tỉnh Phú Yên</Option>
                                            <Option value="Tỉnh Khánh Hòa">Tỉnh Khánh Hòa</Option>
                                            <Option value="Tỉnh Ninh Thuận">Tỉnh Ninh Thuận</Option>
                                            <Option value="Tỉnh Bình Thuận">Tỉnh Bình Thuận</Option>
                                            <Option value="Tỉnh Kon Tum">Tỉnh Kon Tum</Option>
                                            <Option value="Tỉnh Gia Lai">Tỉnh Gia Lai</Option>
                                            <Option value="Tỉnh Đắk Lắk">Tỉnh Đắk Lắk</Option>
                                            <Option value="Tỉnh Đắk Nông">Tỉnh Đắk Nông</Option>
                                            <Option value="Tỉnh Lâm Đồng">Tỉnh Lâm Đồng</Option>
                                            <Option value="Tỉnh Bình Phước">Tỉnh Bình Phước</Option>
                                            <Option value="Tỉnh Tây Ninh">Tỉnh Tây Ninh</Option>
                                            <Option value="Tỉnh Bình Dương">Tỉnh Bình Dương</Option>
                                            <Option value="Tỉnh Đồng Nai">Tỉnh Đồng Nai</Option>
                                            <Option value="Tỉnh Bà Rịa - Vũng Tàu">Tỉnh Bà Rịa - Vũng Tàu</Option>
                                            <Option value="Tỉnh Long An">Tỉnh Long An</Option>
                                            <Option value="Tỉnh Tiền Giang">Tỉnh Tiền Giang</Option>
                                            <Option value="Tỉnh Bến Tre">Tỉnh Bến Tre</Option>
                                            <Option value="Tỉnh Trà Vinh">Tỉnh Trà Vinh</Option>
                                            <Option value="Tỉnh Vĩnh Long">Tỉnh Vĩnh Long</Option>
                                            <Option value="Tỉnh Đồng Tháp">Tỉnh Đồng Tháp</Option>
                                            <Option value="Tỉnh An Giang">Tỉnh An Giang</Option>
                                            <Option value="Tỉnh Kiên Giang">Tỉnh Kiên Giang</Option>
                                            <Option value="Tỉnh Hậu Giang">Tỉnh Hậu Giang</Option>
                                            <Option value="Tỉnh Sóc Trăng">Tỉnh Sóc Trăng</Option>
                                            <Option value="Tỉnh Bạc Liêu">Tỉnh Bạc Liêu</Option>
                                            <Option value="Tỉnh Cà Mau">Tỉnh Cà Mau</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['students', index, 'citizenship']}
                                        label="Quốc tịch"
                                        rules={[{ required: true, message: 'Vui lòng nhập quốc tịch!' }]}
                                    >
                                        <Input placeholder="Nhập quốc tịch" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    ))}

                    <Button
                        type="dashed"
                        onClick={addStudentForm}
                        style={{ width: '100%', marginBottom: '20px' }}
                        icon={<PlusOutlined />}
                    >
                        Thêm học sinh
                    </Button>

                    <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
                        <Button
                            onClick={handleCancel}
                            style={{ marginRight: 8 }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
                        >
                            {editingStudent ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StudentManagement; 