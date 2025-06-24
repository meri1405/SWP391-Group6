import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, DatePicker, Select, Divider, Typography, message, Row, Col, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined, UserOutlined, HomeOutlined, CalendarOutlined, PhoneOutlined, BookOutlined, DownloadOutlined, UploadOutlined, FileExcelOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import './StudentsSection.css';
import StudentDetailModal from './StudentDetailModal';

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
    const [showImportModal, setShowImportModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({});
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [removeParentLoading, setRemoveParentLoading] = useState(false);

    // Fetch students from API
    const fetchStudents = async (page = 1, pageSize = 10, filterValues = {}) => {
        setLoading(true);
        try {
            // Convert page to 0-based for backend (frontend uses 1-based)
            const params = {
                page: page - 1, // Backend expects 0-based pagination
                size: pageSize,
                ...filterValues
            };
            const res = await managerApi.getStudents(params);

            // Map backend data to frontend field names
            const mappedStudents = (res.content || res.students || []).map(student => ({
                id: student.studentID || student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                dob: student.dob,
                gender: student.gender,
                className: student.className,
                birthPlace: student.birthPlace,
                citizenship: student.citizenship,
                address: student.address,
                isDisabled: student.isDisabled || student.disabled,
                fatherId: student.fatherId,
                motherId: student.motherId
            }));

            setStudents(mappedStudents);
            setPagination({
                current: res.pageable?.pageNumber + 1 || page,
                pageSize: res.pageable?.pageSize || pageSize,
                total: res.totalElements || res.total || 0,
            });
        } catch (err) {
            console.error('Error fetching students:', err);
            message.error('Không thể tải danh sách học sinh');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents(pagination.current, pagination.pageSize, filters);
        // eslint-disable-next-line
    }, [pagination.current, pagination.pageSize, filters]);

    const handleTableChange = (pag, _filters, sorter) => {
        setPagination({ ...pagination, current: pag.current, pageSize: pag.pageSize });
    };

    const columns = [
        {
            title: 'Họ và tên',
            key: 'fullName',
            render: (_, record) => (
                <a
                    style={{ color: '#1677ff', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => handleShowDetail(record)}
                >
                    {record.lastName} {record.firstName}
                </a>
            )
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dob',
            key: 'dob',
            render: (dob) => dob ? dayjs(dob).format('DD/MM/YYYY') : ''
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            filters: [{ text: 'Nam', value: 'M' }, { text: 'Nữ', value: 'F' }, { text: 'Khác', value: 'O' }],
            onFilter: (value, record) => record.gender === value,
            render: (g) => g === 'M' ? 'Nam' : g === 'F' ? 'Nữ' : 'Khác'
        },
        {
            title: 'Lớp',
            dataIndex: 'className',
            key: 'className'
        },
        {
            title: 'Nơi sinh',
            dataIndex: 'birthPlace',
            key: 'birthPlace'
        },
        {
            title: 'Quốc tịch',
            dataIndex: 'citizenship',
            key: 'citizenship'
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
            width: 200
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isDisabled',
            key: 'isDisabled',
            render: (disabled) => disabled ?
                <span style={{ color: 'red' }}>Đã vô hiệu hóa</span> :
                <span style={{ color: 'green' }}>Đang hoạt động</span>
        },
        {
            title: 'Phụ huynh',
            key: 'parents',
            render: (_, record) => {
                const parents = [];
                if (record.fatherId) parents.push('Cha');
                if (record.motherId) parents.push('Mẹ');
                return parents.length > 0 ? parents.join(', ') : 'Chưa có';
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        danger
                        size="small"
                        onClick={() => handleDisableStudent(record)}
                        disabled={record.isDisabled}
                        style={{
                            fontSize: '12px',
                            height: '28px',
                            padding: '0 8px',
                            minWidth: '80px'
                        }}
                    >
                        {record.isDisabled ? 'Đã vô hiệu hóa' : 'Vô hiệu hóa'}
                    </Button>
                    <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteStudent(record)}
                        style={{
                            fontSize: '12px',
                            height: '28px',
                            padding: '0 8px'
                        }}
                    />
                </Space>
            ),
        },
    ];

    const handleDeleteStudent = async (student) => {
        Modal.confirm({
            title: 'Xác nhận xóa học sinh',
            content: `Bạn có chắc chắn muốn xóa học sinh "${student.lastName} ${student.firstName}"? Hành động này không thể hoàn tác.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await managerApi.deleteStudent(student.id);
                    message.success('Đã xóa học sinh thành công!');
                    // Refresh the list
                    fetchStudents(pagination.current, pagination.pageSize, filters);
                } catch (error) {
                    console.error('Error deleting student:', error);
                    message.error('Lỗi khi xóa học sinh');
                }
            },
        });
    };

    const handleDisableStudent = async (student) => {
        Modal.confirm({
            title: 'Xác nhận vô hiệu hóa học sinh',
            content: `Bạn có chắc chắn muốn vô hiệu hóa học sinh "${student.lastName} ${student.firstName}"?`,
            okText: 'Vô hiệu hóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    console.log('Disabling student:', student.id);

                    // Update local state immediately for better UX
                    setStudents((prev) => prev.map((s) =>
                        s.id === student.id ? { ...s, isDisabled: true } : s
                    ));

                    // Call API to disable student
                    await managerApi.disableStudent(student.id);

                    message.success('Đã vô hiệu hóa học sinh thành công!');

                    // Refresh the list to get updated data from server
                    fetchStudents(pagination.current, pagination.pageSize, filters);
                } catch (error) {
                    console.error('Error disabling student:', error);
                    message.error('Lỗi khi vô hiệu hóa học sinh');

                    // Revert the local state change if API call failed
                    setStudents((prev) => prev.map((s) =>
                        s.id === student.id ? { ...s, isDisabled: false } : s
                    ));
                }
            },
        });
    };

    const handleAdd = (values) => {
        // For demo, just close modal and reset
        setShowAddModal(false);
        message.success('Đã thêm học sinh và phụ huynh (giả lập)');
    };

    const handleDownloadTemplate = async () => {
        try {
            await managerApi.downloadStudentsTemplate();
            message.success('Đã tải xuống template Excel thành công!');
        } catch (err) {
            message.error('Không thể tải template. Vui lòng thử lại.');
        }
    };

    const handleImportExcel = async (values) => {
        const file = values.file?.file?.originFileObj || values.file?.fileList?.[0]?.originFileObj;
        if (!file) {
            message.error("Vui lòng chọn file Excel!");
            return;
        }
        try {
            await managerApi.importStudentsExcel(file);
            message.success("Import dữ liệu thành công!");
            setShowImportModal(false);
            fetchStudents(pagination.current, pagination.pageSize, filters); // Refresh list
        } catch (err) {
            message.error(
                err?.response?.data?.message ||
                "Import thất bại. Vui lòng kiểm tra lại file và thử lại."
            );
        }
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
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('File phải nhỏ hơn 10MB!');
                return false;
            }
            return false; // Prevent auto upload
        },
        onChange: (info) => {
            if (info.file.status === 'removed') {
                // Handle removal if needed
            }
        },
    };

    const handleShowDetail = (student) => {
        setSelectedStudent(student);
        setDetailModalOpen(true);
    };

    const handleRemoveParent = async (parentType) => {
        if (!selectedStudent) return;
        setRemoveParentLoading(true);
        try {
            await managerApi.removeParentFromStudent(selectedStudent.id, parentType);
            message.success('Đã xóa liên kết ' + (parentType === 'father' ? 'cha' : 'mẹ'));
            setDetailModalOpen(false);
            fetchStudents(pagination.current, pagination.pageSize, filters);
        } catch (e) {
            message.error('Lỗi khi xóa liên kết phụ huynh');
        } finally {
            setRemoveParentLoading(false);
        }
    };

    return (
        <div className="dashboard-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
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
                        onClick={() => navigate('/manager-dashboard/add-students')}
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
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    style={{ borderRadius: 8, overflow: 'auto', minWidth: 320 }}
                    rowClassName={(record) => record.isDisabled ? 'disabled-row' : ''}
                    size="middle"
                    scroll={{ x: 900 }}
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
                }}
                footer={null}
                width={1000}
                style={{ top: 20 }}
            >
                {/* Guide Section */}
                <Card
                    style={{
                        marginBottom: 24,
                        background: '#f1f5f9',
                        border: '2px solid #e0e7ff',
                        borderRadius: 8,
                        boxShadow: '0 2px 6px rgba(102, 126, 234, 0.05)',
                        padding: 0
                    }}
                    bodyStyle={{ padding: '24px 24px' }}
                >
                    <div style={{ color: '#374151', fontWeight: 700, marginBottom: 16, fontSize: '18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#667eea', fontSize: 22 }}>📋</span> <span style={{ color: '#374151' }}>Hướng dẫn nhập thông tin</span>
                    </div>
                    <div style={{ color: '#374151', fontSize: '15px', lineHeight: '1.7' }}>
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
                                    marginBottom: 20,
                                    padding: '16px 24px',
                                    background: '#f1f5f9',
                                    border: '2px solid #e0e7ff',
                                    borderRadius: 8,
                                    color: '#374151',
                                    fontWeight: 700,
                                    fontSize: 18,
                                    gap: 10
                                }}>
                                    <UserOutlined style={{ marginRight: 10, fontSize: 22, color: '#667eea' }} />
                                    <span style={{ color: '#374151', fontWeight: 700, fontSize: 18 }}>Thông tin phụ huynh</span>
                                </div>
                                {fields.map((field, idx) => (
                                    <Card
                                        key={field.key}
                                        style={{
                                            marginBottom: 16,
                                            borderRadius: 12,
                                            background: 'linear-gradient(135deg, #f7fafc 0%, #e3e6ee 100%)',
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
                                                    name={[field.name, 'firstName']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Họ
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Nhập họ' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                                >
                                                    <Input
                                                        placeholder="Nhập họ"
                                                        style={{ borderRadius: '8px', border: 'none', fontWeight: '400' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'lastName']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Tên
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Nhập tên' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                                >
                                                    <Input
                                                        placeholder="Nhập tên"
                                                        style={{ borderRadius: '8px', border: 'none', fontWeight: '400' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 0]}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'dob']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
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
                                                        inputStyle={{ fontWeight: '400' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'gender']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
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
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
                                                            <PhoneOutlined style={{ marginRight: '4px' }} />
                                                            Số điện thoại
                                                        </span>
                                                    }
                                                    rules={[{ pattern: /^(03|05|07|08|09)\d{8}$/, message: 'Số điện thoại phải 10 số, bắt đầu bằng 03, 05, 07, 08, 09' }]}
                                                >
                                                    <Input
                                                        placeholder="Nhập số điện thoại"
                                                        style={{ borderRadius: '8px', border: 'none', fontWeight: '400' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'jobTitle']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Nghề nghiệp
                                                        </span>
                                                    }
                                                    rules={[{ max: 255, message: 'Tối đa 255 ký tự' }]}
                                                >
                                                    <Input
                                                        placeholder="Nghề nghiệp (tùy chọn)"
                                                        style={{ borderRadius: '8px', border: 'none', fontWeight: '400' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item
                                            name={[field.name, 'address']}
                                            label={
                                                <span style={{ color: '#222', fontWeight: '500' }}>
                                                    <HomeOutlined style={{ marginRight: '4px' }} />
                                                    Địa chỉ
                                                </span>
                                            }
                                            rules={[{ required: true, message: 'Nhập địa chỉ' }, { min: 10, max: 200, message: '10-200 ký tự' }]}
                                        >
                                            <Input
                                                placeholder="Nhập địa chỉ"
                                                style={{ borderRadius: '8px', border: 'none', fontWeight: '400' }}
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
                                    marginBottom: 20,
                                    padding: '16px 24px',
                                    background: '#f1f5f9',
                                    border: '2px solid #e0e7ff',
                                    borderRadius: 8,
                                    color: '#374151',
                                    fontWeight: 700,
                                    fontSize: 18,
                                    gap: 10
                                }}>
                                    <BookOutlined style={{ marginRight: 10, fontSize: 22, color: '#667eea' }} />
                                    <span style={{ color: '#374151', fontWeight: 700, fontSize: 18 }}>Thông tin học sinh</span>
                                </div>
                                {fields.map((field, idx) => (
                                    <Card
                                        key={field.key}
                                        style={{
                                            marginBottom: 16,
                                            borderRadius: 12,
                                            background: 'linear-gradient(135deg, #f7fafc 0%, #e3e6ee 100%)',
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
                                                    name={[field.name, 'firstName']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Họ
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Nhập họ' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                                >
                                                    <Input
                                                        placeholder="Nhập họ"
                                                        style={{ borderRadius: '8px', border: 'none', fontWeight: '400' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'lastName']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Tên
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Nhập tên' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }]}
                                                >
                                                    <Input
                                                        placeholder="Nhập tên"
                                                        style={{ borderRadius: '8px', border: 'none', fontWeight: '400' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 0]}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'dob']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
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
                                                        inputStyle={{ fontWeight: '400' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'gender']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
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
                                                    name={[field.name, 'birthPlace']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
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
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
                                                            <UserOutlined style={{ marginRight: '4px' }} />
                                                            Quốc tịch
                                                        </span>
                                                    }
                                                    initialValue="Việt Nam"
                                                >
                                                    <Input
                                                        placeholder="Quốc tịch"
                                                        style={{ borderRadius: '8px', border: 'none', fontWeight: '400' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 0]}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'address']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
                                                            <HomeOutlined style={{ marginRight: '4px' }} />
                                                            Địa chỉ nhà
                                                        </span>
                                                    }
                                                >
                                                    <Input
                                                        placeholder="Địa chỉ nhà"
                                                        style={{ borderRadius: '8px', border: 'none', fontWeight: '400' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name={[field.name, 'className']}
                                                    label={
                                                        <span style={{ color: '#222', fontWeight: '500' }}>
                                                            <BookOutlined style={{ marginRight: '4px' }} />
                                                            Lớp
                                                        </span>
                                                    }
                                                    rules={[{ required: true, message: 'Nhập lớp' }]}
                                                >
                                                    <Input
                                                        placeholder="Lớp"
                                                        style={{ borderRadius: '8px', border: 'none', fontWeight: '400' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item name={[field.name, 'fatherId']} hidden><Input type="hidden" /></Form.Item>
                                        <Form.Item name={[field.name, 'motherId']} hidden><Input type="hidden" /></Form.Item>
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

            {/* Import Excel Modal */}
            <Modal
                title={
                    <div style={{ textAlign: 'center', fontSize: '22px', fontWeight: '700', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <FileExcelOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                        Import học sinh và phụ huynh từ Excel
                    </div>
                }
                open={showImportModal}
                onCancel={() => {
                    setShowImportModal(false);
                }}
                footer={null}
                width={800}
                style={{ top: 20 }}
                className="admin-profile-main-card"
            >
                {/* Guide Section */}
                <Card
                    className="admin-form-section"
                    style={{
                        marginBottom: 24,
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        border: '2px solid #e0e7ff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 15px rgba(82, 196, 26, 0.2)'
                    }}
                    bodyStyle={{ padding: '24px' }}
                >
                    <div style={{ color: '#374151', fontWeight: '700', marginBottom: 16, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📋 Hướng dẫn import Excel
                    </div>
                    <div style={{ color: '#374151', fontSize: '15px', lineHeight: '1.7' }}>
                        <Row gutter={[20, 12]}>
                            <Col span={12}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ color: '#52c41a', fontWeight: '600' }}>•</span>
                                    <span>Tải template mẫu để xem cấu trúc file</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ color: '#52c41a', fontWeight: '600' }}>•</span>
                                    <span>Mở file CSV bằng Excel, sau đó lưu lại dưới dạng .xlsx</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#52c41a', fontWeight: '600' }}>•</span>
                                    <span>File phải nhỏ hơn 10MB</span>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ color: '#52c41a', fontWeight: '600' }}>•</span>
                                    <span>Hỗ trợ file .xlsx, .xls, .csv</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ color: '#52c41a', fontWeight: '600' }}>•</span>
                                    <span>Mỗi dòng = 1 học sinh + phụ huynh</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#52c41a', fontWeight: '600' }}>•</span>
                                    <span>Các trường bắt buộc phải điền đầy đủ</span>
                                </div>
                            </Col>
                        </Row>
                        <div style={{
                            marginTop: '16px',
                            padding: '12px 16px',
                            background: 'linear-gradient(135deg, #fff7e6 0%, #ffeaa7 100%)',
                            border: '1px solid #ffd591',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#d46b08'
                        }}>
                            <strong>💡 Lưu ý về font chữ:</strong> Nếu template hiển thị lỗi font, hãy mở file CSV bằng Excel, sau đó lưu lại với định dạng .xlsx để đảm bảo tiếng Việt hiển thị đúng.
                        </div>
                    </div>
                </Card>

                <Form
                    layout="vertical"
                    onFinish={handleImportExcel}
                    autoComplete="off"
                >
                    <Card
                        className="admin-profile-main-card"
                        style={{
                            marginBottom: 24,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            border: '2px solid #e0e7ff',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '20px',
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '10px',
                            color: 'white',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}>
                            <UploadOutlined style={{ marginRight: '12px', fontSize: '20px' }} />
                            <Title level={5} style={{ margin: 0, color: 'white' }}>Chọn file Excel</Title>
                        </div>

                        <Form.Item
                            name="file"
                            rules={[{ required: true, message: 'Vui lòng chọn file Excel' }]}
                        >
                            <Upload.Dragger {...uploadProps} style={{
                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                border: '2px dashed #667eea',
                                borderRadius: '12px',
                                padding: '32px 16px'
                            }}>
                                <p className="ant-upload-drag-icon" style={{ color: '#52c41a' }}>
                                    <FileExcelOutlined style={{ fontSize: '56px' }} />
                                </p>
                                <p className="ant-upload-text" style={{ color: '#374151', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                    Kéo thả file Excel vào đây hoặc click để chọn
                                </p>
                                <p className="ant-upload-hint" style={{ color: '#64748b', fontSize: '14px' }}>
                                    Hỗ trợ file .xlsx, .xls, .csv (tối đa 10MB)
                                </p>
                            </Upload.Dragger>
                        </Form.Item>

                        <div style={{
                            marginTop: '20px',
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            border: '1px solid #bae6fd',
                            borderRadius: '10px',
                            color: '#0c4a6e',
                            fontSize: '14px'
                        }}>
                            <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                📝 Lưu ý quan trọng:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '24px', lineHeight: '1.6' }}>
                                <li>Ngày tháng phải theo định dạng YYYY-MM-DD</li>
                                <li>Giới tính: Nam, Nữ, Khác</li>
                                <li>Nơi sinh phải chọn từ danh sách có sẵn</li>
                                <li>Quốc tịch mặc định là "Việt Nam"</li>
                                <li>Nếu file CSV bị lỗi font, mở bằng Excel và lưu lại dưới dạng .xlsx</li>
                                <li>Đảm bảo không có ký tự đặc biệt trong dữ liệu</li>
                            </ul>
                        </div>
                    </Card>

                    <Divider style={{ margin: '32px 0', borderColor: '#e2e8f0', borderWidth: '2px' }} />
                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'center', gap: '20px' }}>
                            <Button
                                onClick={() => {
                                    setShowImportModal(false);
                                }}
                                style={{
                                    height: '48px',
                                    padding: '0 36px',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    border: '2px solid #d1d5db',
                                    color: '#6b7280',
                                    background: 'white',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    height: '48px',
                                    padding: '0 36px',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 15px rgba(82, 196, 26, 0.4)'
                                }}
                            >
                                Import dữ liệu
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <StudentDetailModal
                open={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                student={selectedStudent}
                onRemoveParent={handleRemoveParent}
                loading={removeParentLoading}
            />
        </div>
    );
};

export default StudentsSection; 