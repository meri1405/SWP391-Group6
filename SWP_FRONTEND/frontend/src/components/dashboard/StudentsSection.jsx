import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, DatePicker, Select, Divider, Typography, message, Row, Col, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined, UserOutlined, HomeOutlined, CalendarOutlined, PhoneOutlined, BookOutlined, DownloadOutlined, UploadOutlined, FileExcelOutlined } from '@ant-design/icons';
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
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [importForm] = Form.useForm();
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

    const handleDownloadTemplate = () => {
        // Tạo dữ liệu mẫu cho template Excel
        const templateData = [
            {
                'Họ phụ huynh': 'Nguyễn',
                'Tên phụ huynh': 'Văn A',
                'Ngày sinh phụ huynh': '1980-01-01',
                'Giới tính phụ huynh': 'Nam',
                'Địa chỉ phụ huynh': '123 Đường ABC, Quận 1, TP.HCM',
                'Số điện thoại phụ huynh': '0901234567',
                'Nghề nghiệp phụ huynh': 'Kỹ sư',
                'Họ học sinh': 'Nguyễn',
                'Tên học sinh': 'Thị B',
                'Ngày sinh học sinh': '2015-05-15',
                'Giới tính học sinh': 'Nữ',
                'Nơi sinh học sinh': 'Thành phố Hồ Chí Minh',
                'Quốc tịch học sinh': 'Việt Nam',
                'Địa chỉ học sinh': '123 Đường ABC, Quận 1, TP.HCM',
                'Lớp học sinh': '1A'
            }
        ];

        // Tạo file CSV với encoding UTF-8 BOM để Excel đọc đúng tiếng Việt
        const csvContent = [
            Object.keys(templateData[0]).join(','),
            ...templateData.map(row => Object.values(row).join(','))
        ].join('\n');

        // Thêm BOM (Byte Order Mark) để Excel nhận diện UTF-8
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        // Tạo file với encoding UTF-8
        const blob = new Blob([csvWithBOM], {
            type: 'text/csv;charset=utf-8;'
        });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'template_hoc_sinh_phu_huynh.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Hiển thị hướng dẫn sử dụng
        message.success('Đã tải xuống template thành công! Vui lòng mở bằng Excel và lưu lại với định dạng .xlsx để đảm bảo font chữ hiển thị đúng.');
    };

    const handleImportExcel = (values) => {
        // Xử lý import Excel (giả lập)
        console.log('Import data:', values);
        message.success('Import dữ liệu thành công!');
        setShowImportModal(false);
        importForm.resetFields();
    };

    const uploadProps = {
        name: 'file',
        accept: '.xlsx,.xls,.csv',
        beforeUpload: (file) => {
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel' ||
                file.type === 'text/csv';
            if (!isExcel) {
                message.error('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV!');
                return false;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('File phải nhỏ hơn 2MB!');
                return false;
            }
            return false; // Prevent auto upload
        },
        onChange: (info) => {
            if (info.file.status === 'removed') {
                importForm.setFieldsValue({ file: undefined });
            }
        },
    };

    return (
        <div className="dashboard-section">
            <div className="section-header">
                <h2 style={{ fontSize: 24, fontWeight: 600, color: '#333', margin: 0 }}>Học sinh</h2>
                <Space size="middle">
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleDownloadTemplate}
                        style={{
                            borderRadius: 6,
                            fontWeight: 500,
                            border: '2px solid #52c41a',
                            color: '#52c41a',
                            background: 'white'
                        }}
                    >
                        Tải template
                    </Button>
                    <Button
                        icon={<UploadOutlined />}
                        onClick={() => setShowImportModal(true)}
                        style={{
                            borderRadius: 6,
                            fontWeight: 500,
                            border: '2px solid #1890ff',
                            color: '#1890ff',
                            background: 'white'
                        }}
                    >
                        Import Excel
                    </Button>
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
                </Space>
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
                title={
                    <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: '600', color: '#1890ff' }}>
                        <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Thêm học sinh và phụ huynh
                    </div>
                }
                open={showAddModal}
                onCancel={() => {
                    setShowAddModal(false);
                    form.resetFields();
                }}
                footer={null}
                width={1000}
                style={{ top: 20 }}
            >
                {/* Guide Section */}
                <Card
                    style={{
                        marginBottom: 24,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <div style={{ color: 'white', fontWeight: 600, marginBottom: 12, fontSize: '16px' }}>
                        📋 Hướng dẫn nhập thông tin
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: '1.6' }}>
                        <Row gutter={[16, 8]}>
                            <Col span={12}>
                                <div>• Họ và tên: 2-50 ký tự, chỉ chữ cái tiếng Việt</div>
                                <div>• Số điện thoại: 10 số, bắt đầu bằng 03, 05, 07, 08, 09</div>
                                <div>• Ngày sinh phụ huynh: Tuổi từ 18-100</div>
                            </Col>
                            <Col span={12}>
                                <div>• Ngày sinh học sinh: Từ 6 đến 12 tuổi</div>
                                <div>• Địa chỉ: 10-200 ký tự</div>
                                <div>• Có thể thêm tối đa 2 phụ huynh và 5 học sinh</div>
                            </Col>
                        </Row>
                    </div>
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
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '16px',
                                    padding: '12px 16px',
                                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                                    borderRadius: '8px',
                                    color: '#d63384',
                                    fontWeight: '600'
                                }}>
                                    <UserOutlined style={{ marginRight: '8px', fontSize: '18px' }} />
                                    <Title level={5} style={{ margin: 0, color: '#d63384' }}>Thông tin phụ huynh</Title>
                                </div>
                                {fields.map((field, idx) => (
                                    <Card
                                        key={field.key}
                                        style={{
                                            marginBottom: 16,
                                            borderRadius: 12,
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 0%, #4facfe 100%)',
                                            border: 'none',
                                            boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)',
                                            position: 'relative'
                                        }}
                                        bodyStyle={{ padding: '24px' }}
                                    >
                                        {fields.length > 1 && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(field.name)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 12,
                                                    background: 'rgba(255,255,255,0.9)',
                                                    borderRadius: '6px',
                                                    border: 'none'
                                                }}
                                            >
                                                Xóa phụ huynh
                                            </Button>
                                        )}
                                        <Row gutter={[16, 0]}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'first_name']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Họ
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Nhập họ' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                                >
                                                    <Input
                                                        placeholder="Nhập họ"
                                                        style={{ borderRadius: '8px', border: 'none' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'last_name']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Tên
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Nhập tên' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                                >
                                                    <Input
                                                        placeholder="Nhập tên"
                                                        style={{ borderRadius: '8px', border: 'none' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 0]}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'dob']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <CalendarOutlined style={{ marginRight: '4px' }} />
                                                            Ngày sinh
                                                        </span>
                                                    }
                                                    rules={[{
                                                        validator: (_, value) => {
                                                            if (!value) return Promise.reject('Chọn ngày sinh');
                                                            const age = dayjs().diff(dayjs(value), 'year');
                                                            if (age < 18 || age > 100) return Promise.reject('Tuổi phụ huynh phải từ 18-100');
                                                            return Promise.resolve();
                                                        }
                                                    }]}
                                                >
                                                    <DatePicker
                                                        style={{ width: '100%', borderRadius: '8px', border: 'none' }}
                                                        format="DD/MM/YYYY"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'gender']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Giới tính
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Chọn giới tính' }]}
                                                >
                                                    <Select
                                                        options={genderOptions}
                                                        placeholder="Chọn giới tính"
                                                        style={{ borderRadius: '8px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 0]}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'phone']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <PhoneOutlined style={{ marginRight: '4px' }} />
                                                            Số điện thoại
                                                        </span>
                                                    }
                                                    rules={[{ pattern: /^(03|05|07|08|09)\d{8}$/, message: 'Số điện thoại phải 10 số, bắt đầu bằng 03, 05, 07, 08, 09' }]}
                                                >
                                                    <Input
                                                        placeholder="Nhập số điện thoại"
                                                        style={{ borderRadius: '8px', border: 'none' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'job_title']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Nghề nghiệp
                                                        </span>
                                                    }
                                                    rules={[{ max: 255, message: 'Tối đa 255 ký tự' }]}
                                                >
                                                    <Input
                                                        placeholder="Nghề nghiệp (tùy chọn)"
                                                        style={{ borderRadius: '8px', border: 'none' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item
                                            name={[field.name, 'address']}
                                            label={
                                                <span style={{ color: 'white', fontWeight: '500' }}>
                                                    <HomeOutlined style={{ marginRight: '4px' }} />
                                                    Địa chỉ
                                                </span>
                                            }
                                            rules={[{ required: true, message: 'Nhập địa chỉ' }, { min: 10, max: 200, message: '10-200 ký tự' }]}
                                        >
                                            <Input
                                                placeholder="Nhập địa chỉ"
                                                style={{ borderRadius: '8px', border: 'none' }}
                                            />
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
                                    style={{
                                        width: '100%',
                                        marginBottom: 24,
                                        height: '50px',
                                        borderRadius: '8px',
                                        border: '2px dashed #d63384',
                                        color: '#d63384',
                                        fontSize: '16px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Thêm phụ huynh
                                </Button>
                            </>
                        )}
                    </Form.List>
                    <Divider style={{ margin: '32px 0', borderColor: '#e8e8e8' }} />
                    <Form.List name="students" initialValue={[{}]} rules={[{ validator: async (_, students) => { if (!students || students.length < 1) throw new Error('Ít nhất 1 học sinh'); if (students.length > 5) throw new Error('Tối đa 5 học sinh'); } }]}
                    >
                        {(fields, { add, remove }) => (
                            <>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '16px',
                                    padding: '12px 16px',
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: '600'
                                }}>
                                    <BookOutlined style={{ marginRight: '8px', fontSize: '18px' }} />
                                    <Title level={5} style={{ margin: 0, color: 'white' }}>Thông tin học sinh</Title>
                                </div>
                                {fields.map((field, idx) => (
                                    <Card
                                        key={field.key}
                                        style={{
                                            marginBottom: 16,
                                            borderRadius: 12,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                            position: 'relative'
                                        }}
                                        bodyStyle={{ padding: '24px' }}
                                    >
                                        {fields.length > 1 && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(field.name)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 12,
                                                    background: 'rgba(255,255,255,0.9)',
                                                    borderRadius: '6px',
                                                    border: 'none'
                                                }}
                                            >
                                                Xóa học sinh
                                            </Button>
                                        )}
                                        <Row gutter={[16, 0]}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'first_name']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Họ
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Nhập họ' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                                >
                                                    <Input
                                                        placeholder="Nhập họ"
                                                        style={{ borderRadius: '8px', border: 'none' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'last_name']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Tên
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Nhập tên' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                                >
                                                    <Input
                                                        placeholder="Nhập tên"
                                                        style={{ borderRadius: '8px', border: 'none' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 0]}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'dob']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <CalendarOutlined style={{ marginRight: '4px' }} />
                                                            Ngày sinh
                                                        </span>
                                                    }
                                                    rules={[{
                                                        validator: (_, value) => {
                                                            if (!value) return Promise.reject('Chọn ngày sinh');
                                                            const age = dayjs().diff(dayjs(value), 'year');
                                                            if (age < 6 || age > 12) return Promise.reject('Tuổi học sinh phải từ 6-12');
                                                            return Promise.resolve();
                                                        }
                                                    }]}
                                                >
                                                    <DatePicker
                                                        style={{ width: '100%', borderRadius: '8px', border: 'none' }}
                                                        format="DD/MM/YYYY"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'gender']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Giới tính
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Chọn giới tính' }]}
                                                >
                                                    <Select
                                                        options={genderOptions}
                                                        placeholder="Chọn giới tính"
                                                        style={{ borderRadius: '8px' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 0]}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'birth_place']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <HomeOutlined style={{ marginRight: '4px' }} />
                                                            Nơi sinh
                                                        </span>
                                                    }
                                                >
                                                    <Select
                                                        placeholder="Chọn nơi sinh"
                                                        style={{ borderRadius: '8px' }}
                                                    >
                                                        {birthPlaceOptions.map((place) => (
                                                            <Option key={place} value={place}>{place}</Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'citizenship']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Quốc tịch
                                                        </span>
                                                    }
                                                    initialValue="Việt Nam"
                                                >
                                                    <Input
                                                        placeholder="Quốc tịch"
                                                        style={{ borderRadius: '8px', border: 'none' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 0]}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'address']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <HomeOutlined style={{ marginRight: '4px' }} />
                                                            Địa chỉ nhà
                                                        </span>
                                                    }
                                                >
                                                    <Input
                                                        placeholder="Địa chỉ nhà"
                                                        style={{ borderRadius: '8px', border: 'none' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'class_name']}
                                                    label={
                                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                                            <BookOutlined style={{ marginRight: '4px' }} />
                                                            Lớp
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Nhập lớp' }]}
                                                >
                                                    <Input
                                                        placeholder="Lớp"
                                                        style={{ borderRadius: '8px', border: 'none' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item name={[field.name, 'father_id']} hidden><Input type="hidden" /></Form.Item>
                                        <Form.Item name={[field.name, 'mother_id']} hidden><Input type="hidden" /></Form.Item>
                                    </Card>
                                ))}
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    icon={<PlusOutlined />}
                                    disabled={fields.length >= 5}
                                    style={{
                                        width: '100%',
                                        marginBottom: 24,
                                        height: '50px',
                                        borderRadius: '8px',
                                        border: '2px dashed #4facfe',
                                        color: '#4facfe',
                                        fontSize: '16px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Thêm học sinh
                                </Button>
                            </>
                        )}
                    </Form.List>
                    <Divider style={{ margin: '32px 0', borderColor: '#e8e8e8' }} />
                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'center', gap: '16px' }}>
                            <Button
                                onClick={() => {
                                    setShowAddModal(false);
                                    form.resetFields();
                                }}
                                style={{
                                    height: '45px',
                                    padding: '0 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    border: '2px solid #d9d9d9',
                                    color: '#666'
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    height: '45px',
                                    padding: '0 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                }}
                            >
                                Thêm
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title={
                    <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: '600', color: '#1890ff' }}>
                        <EditOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Sửa thông tin học sinh
                    </div>
                }
                open={showEditModal}
                onCancel={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                    editForm.resetFields();
                }}
                footer={null}
                width={800}
                style={{ top: 20 }}
            >
                <Card
                    style={{
                        marginBottom: 24,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <div style={{ color: 'white', fontWeight: 600, marginBottom: 12, fontSize: '16px' }}>
                        📋 Hướng dẫn cập nhật thông tin
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: '1.6' }}>
                        <Row gutter={[16, 8]}>
                            <Col span={12}>
                                <div>• Họ và tên: 2-50 ký tự, chỉ chữ cái tiếng Việt</div>
                                <div>• Ngày sinh học sinh: Từ 6 đến 12 tuổi</div>
                                <div>• Địa chỉ: 10-200 ký tự</div>
                            </Col>
                            <Col span={12}>
                                <div>• Nơi sinh: Chọn từ danh sách tỉnh/thành phố</div>
                                <div>• Giới tính: Bắt buộc chọn</div>
                                <div>• Lớp: Bắt buộc nhập</div>
                            </Col>
                        </Row>
                    </div>
                </Card>
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSave}
                    initialValues={editingStudent}
                    autoComplete="off"
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '16px',
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: '600'
                    }}>
                        <BookOutlined style={{ marginRight: '8px', fontSize: '18px' }} />
                        <Title level={5} style={{ margin: 0, color: 'white' }}>Thông tin học sinh</Title>
                    </div>

                    <Card
                        style={{
                            marginBottom: 16,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                            position: 'relative'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <Row gutter={[16, 0]}>
                            <Col span={12}>
                                <Form.Item
                                    name="first_name"
                                    label={
                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                            <UserOutlined style={{ marginRight: '4px' }} />
                                            Họ *
                                        </span>
                                    }
                                    rules={[{ required: true, message: 'Nhập họ' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                >
                                    <Input
                                        placeholder="Nhập họ"
                                        style={{ borderRadius: '8px', border: 'none' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="last_name"
                                    label={
                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                            <UserOutlined style={{ marginRight: '4px' }} />
                                            Tên *
                                        </span>
                                    }
                                    rules={[{ required: true, message: 'Nhập tên' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                >
                                    <Input
                                        placeholder="Nhập tên"
                                        style={{ borderRadius: '8px', border: 'none' }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col span={12}>
                                <Form.Item
                                    name="dob"
                                    label={
                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                            <CalendarOutlined style={{ marginRight: '4px' }} />
                                            Ngày sinh *
                                        </span>
                                    }
                                    rules={[{
                                        validator: (_, value) => {
                                            if (!value) return Promise.reject('Chọn ngày sinh');
                                            const age = dayjs().diff(dayjs(value), 'year');
                                            if (age < 6 || age > 12) return Promise.reject('Tuổi học sinh phải từ 6-12');
                                            return Promise.resolve();
                                        }
                                    }]}
                                >
                                    <DatePicker
                                        style={{ width: '100%', borderRadius: '8px', border: 'none' }}
                                        format="DD/MM/YYYY"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="gender"
                                    label={
                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                            <UserOutlined style={{ marginRight: '4px' }} />
                                            Giới tính *
                                        </span>
                                    }
                                    rules={[{ required: true, message: 'Chọn giới tính' }]}
                                >
                                    <Select
                                        options={genderOptions}
                                        placeholder="Chọn giới tính"
                                        style={{ borderRadius: '8px' }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col span={12}>
                                <Form.Item
                                    name="birth_place"
                                    label={
                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                            <HomeOutlined style={{ marginRight: '4px' }} />
                                            Nơi sinh
                                        </span>
                                    }
                                >
                                    <Select
                                        placeholder="Chọn nơi sinh"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        {birthPlaceOptions.map((place) => (
                                            <Option key={place} value={place}>{place}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="citizenship"
                                    label={
                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                            <UserOutlined style={{ marginRight: '4px' }} />
                                            Quốc tịch
                                        </span>
                                    }
                                    initialValue="Việt Nam"
                                >
                                    <Input
                                        placeholder="Quốc tịch"
                                        style={{ borderRadius: '8px', border: 'none' }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 0]}>
                            <Col span={12}>
                                <Form.Item
                                    name="address"
                                    label={
                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                            <HomeOutlined style={{ marginRight: '4px' }} />
                                            Địa chỉ nhà
                                        </span>
                                    }
                                >
                                    <Input
                                        placeholder="Địa chỉ nhà"
                                        style={{ borderRadius: '8px', border: 'none' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="class_name"
                                    label={
                                        <span style={{ color: 'white', fontWeight: '500' }}>
                                            <BookOutlined style={{ marginRight: '4px' }} />
                                            Lớp *
                                        </span>
                                    }
                                    rules={[{ required: true, message: 'Nhập lớp' }]}
                                >
                                    <Input
                                        placeholder="Lớp"
                                        style={{ borderRadius: '8px', border: 'none' }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    <Divider style={{ margin: '32px 0', borderColor: '#e8e8e8' }} />
                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'center', gap: '16px' }}>
                            <Button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingStudent(null);
                                    editForm.resetFields();
                                }}
                                style={{
                                    height: '45px',
                                    padding: '0 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    border: '2px solid #d9d9d9',
                                    color: '#666'
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    height: '45px',
                                    padding: '0 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                }}
                            >
                                Lưu thay đổi
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Import Excel Modal */}
            <Modal
                title={
                    <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: '600', color: '#1890ff' }}>
                        <FileExcelOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Import học sinh và phụ huynh từ Excel
                    </div>
                }
                open={showImportModal}
                onCancel={() => {
                    setShowImportModal(false);
                    importForm.resetFields();
                }}
                footer={null}
                width={700}
                style={{ top: 20 }}
            >
                {/* Guide Section */}
                <Card
                    style={{
                        marginBottom: 24,
                        background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 15px rgba(82, 196, 26, 0.3)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <div style={{ color: 'white', fontWeight: 600, marginBottom: 12, fontSize: '16px' }}>
                        📋 Hướng dẫn import Excel
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: '1.6' }}>
                        <Row gutter={[16, 8]}>
                            <Col span={12}>
                                <div>• Tải template mẫu để xem cấu trúc file</div>
                                <div>• Mở file CSV bằng Excel, sau đó lưu lại dưới dạng .xlsx</div>
                                <div>• File phải nhỏ hơn 2MB</div>
                            </Col>
                            <Col span={12}>
                                <div>• Hỗ trợ file .xlsx, .xls, .csv</div>
                                <div>• Mỗi dòng = 1 học sinh + phụ huynh</div>
                                <div>• Các trường bắt buộc phải điền đầy đủ</div>
                            </Col>
                        </Row>
                        <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            fontSize: '13px'
                        }}>
                            <strong>💡 Lưu ý về font chữ:</strong> Nếu template hiển thị lỗi font, hãy mở file CSV bằng Excel, sau đó lưu lại với định dạng .xlsx để đảm bảo tiếng Việt hiển thị đúng.
                        </div>
                    </div>
                </Card>

                <Form
                    form={importForm}
                    layout="vertical"
                    onFinish={handleImportExcel}
                    autoComplete="off"
                >
                    <Card
                        style={{
                            marginBottom: 24,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '16px',
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: '600'
                        }}>
                            <UploadOutlined style={{ marginRight: '8px', fontSize: '18px' }} />
                            <Title level={5} style={{ margin: 0, color: 'white' }}>Chọn file Excel</Title>
                        </div>

                        <Form.Item
                            name="file"
                            rules={[{ required: true, message: 'Vui lòng chọn file Excel' }]}
                        >
                            <Upload.Dragger {...uploadProps} style={{ background: 'rgba(255,255,255,0.1)', border: '2px dashed rgba(255,255,255,0.3)' }}>
                                <p className="ant-upload-drag-icon" style={{ color: 'white' }}>
                                    <FileExcelOutlined style={{ fontSize: '48px' }} />
                                </p>
                                <p className="ant-upload-text" style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                                    Kéo thả file Excel vào đây hoặc click để chọn
                                </p>
                                <p className="ant-upload-hint" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Hỗ trợ file .xlsx, .xls, .csv (tối đa 2MB)
                                </p>
                            </Upload.Dragger>
                        </Form.Item>

                        <div style={{
                            marginTop: '16px',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '14px'
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '8px' }}>📝 Lưu ý:</div>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Ngày tháng phải theo định dạng YYYY-MM-DD</li>
                                <li>Giới tính: Nam, Nữ, Khác</li>
                                <li>Nơi sinh phải chọn từ danh sách có sẵn</li>
                                <li>Quốc tịch mặc định là "Việt Nam"</li>
                                <li>Nếu file CSV bị lỗi font, mở bằng Excel và lưu lại dưới dạng .xlsx</li>
                                <li>Đảm bảo không có ký tự đặc biệt trong dữ liệu</li>
                            </ul>
                        </div>
                    </Card>

                    <Divider style={{ margin: '32px 0', borderColor: '#e8e8e8' }} />
                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'center', gap: '16px' }}>
                            <Button
                                onClick={() => {
                                    setShowImportModal(false);
                                    importForm.resetFields();
                                }}
                                style={{
                                    height: '45px',
                                    padding: '0 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    border: '2px solid #d9d9d9',
                                    color: '#666'
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    height: '45px',
                                    padding: '0 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 15px rgba(82, 196, 26, 0.3)'
                                }}
                            >
                                Import dữ liệu
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StudentsSection; 