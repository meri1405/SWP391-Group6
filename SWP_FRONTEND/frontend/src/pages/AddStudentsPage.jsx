import React from 'react';
import { Card, Button, Form, Input, Space, DatePicker, Select, Divider, Typography, message, Row, Col } from 'antd';
import { PlusOutlined, UserOutlined, HomeOutlined, CalendarOutlined, PhoneOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import '../styles/AdminDashboard.css';
import '../styles/AdminProfile.css';
import { managerApi } from '../api/managerApi';

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

const vietnameseNameRegex = /^[a-zA-ZĂăÂâĐđÊêÔôƠơƯưÁáÀàẢảÃãẠạĂăẮắẰằẲẳẴẵẶặÂâẤấẦầẨẩẪẫẬậÉéÈèẺẻẼẽẸẹÊêẾếỀềỂểỄễỆệÍíÌìỈỉĨĩỊịÓóÒòỎỏÕõỌọÔôỐốỒồỔổỖỗỘộƠơỚớỜờỞởỠỡỢợÚúÙùỦủŨũỤụƯưỨứỪừỬửỮữỰựÝýỲỳỶỷỸỹỴỵ\s]+$/;

const AddStudentsPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const phoneRules = [
        { required: true, pattern: /^(03|05|07|08|09)\d{8}$/, message: 'Số điện thoại phải 10 số, bắt đầu bằng 03, 05, 07, 08, 09' }
    ];
    const nameRules = [
        { required: true, message: 'Không được để trống' }, { min: 2, max: 50, message: '2-50 ký tự' }, { pattern: vietnameseNameRegex, message: 'Chỉ chữ cái tiếng Việt' }
    ];
    const addressRules = [
        { required: true, message: 'Nhập địa chỉ' }, { min: 10, max: 200, message: '10-200 ký tự' }
    ];
    const jobTitleRules = [
        { required: true, message: 'Nhập nghề nghiệp' }, { min: 2, max: 255, message: '2-255 ký tự' }
    ];

    // Helper function to split full name into first and last name
    const splitName = (fullName) => {
        if (!fullName || !fullName.trim()) {
            return { firstName: '', lastName: '' };
        }
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) {
            return { firstName: parts[0], lastName: parts[0] }; // Use same name for both if only one word
        }
        const lastName = parts[0];
        const firstName = parts.slice(1).join(' ');
        return { firstName, lastName };
    };

    // Helper function to validate parent age (must be at least 18 years old)
    const validateParentAge = (_, value) => {
        if (!value) {
            return Promise.reject('Chọn ngày sinh');
        }
        const age = dayjs().diff(dayjs(value), 'year');
        if (age < 18) {
            return Promise.reject('Phụ huynh phải ít nhất 18 tuổi');
        }
        if (age > 80) {
            return Promise.reject('Phụ huynh không thể quá 80 tuổi');
        }
        return Promise.resolve();
    };

    const handleAdd = async (values) => {
        try {
            console.log('🚀 Form values received:', values);

            // Split student name into first and last name
            const { firstName: studentFirstName, lastName: studentLastName } = splitName(values.studentName);
            console.log('📝 Split student name:', { studentFirstName, studentLastName });

            // Prepare student object according to backend DTO structure
            const student = {
                firstName: studentFirstName,
                lastName: studentLastName,
                gender: values.gender,
                dob: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
                address: values.address,
                citizenship: values.citizenship,
                className: values.className || 'Chưa phân lớp',
                birthPlace: values.birthPlace || 'Chưa xác định',
                isDisabled: false // Set to false so students appear in the list
            };
            console.log('👨‍🎓 Student object:', student);

            // Prepare parents
            let father = undefined;
            let mother = undefined;

            // If any father field is filled, require all
            const hasFather = values.fatherFirstName || values.fatherLastName || values.fatherDob || values.fatherGender || values.fatherAddress || values.fatherPhone || values.fatherJobTitle;
            console.log('👨 Has father data:', hasFather);
            if (hasFather) {
                const { firstName: fatherFirstName, lastName: fatherLastName } = splitName(values.fatherFirstName + ' ' + values.fatherLastName);
                father = {
                    firstName: fatherFirstName,
                    lastName: fatherLastName,
                    dob: values.fatherDob ? values.fatherDob.format('YYYY-MM-DD') : undefined,
                    gender: values.fatherGender,
                    address: values.fatherAddress,
                    phone: values.fatherPhone,
                    jobTitle: values.fatherJobTitle
                };
                console.log('👨 Father object:', father);
            }

            // If any mother field is filled, require all
            const hasMother = values.motherFirstName || values.motherLastName || values.motherDob || values.motherGender || values.motherAddress || values.motherPhone || values.motherJobTitle;
            console.log('👩 Has mother data:', hasMother);
            if (hasMother) {
                const { firstName: motherFirstName, lastName: motherLastName } = splitName(values.motherFirstName + ' ' + values.motherLastName);
                mother = {
                    firstName: motherFirstName,
                    lastName: motherLastName,
                    dob: values.motherDob ? values.motherDob.format('YYYY-MM-DD') : undefined,
                    gender: values.motherGender,
                    address: values.motherAddress,
                    phone: values.motherPhone,
                    jobTitle: values.motherJobTitle
                };
                console.log('👩 Mother object:', mother);
            }

            // Prepare payload according to backend DTO structure
            const payload = {
                students: [student] // Backend expects a list of students
            };
            if (father) payload.father = father;
            if (mother) payload.mother = mother;

            console.log('📦 Final payload to send:', payload);
            console.log('🌐 Calling managerApi.createStudentWithParents...');

            const response = await managerApi.createStudentWithParents(payload);
            console.log('✅ API response:', response);

            message.success('Đã thêm học sinh và phụ huynh thành công!');
            navigate('/manager-dashboard');
        } catch (e) {
            console.error('❌ Error in handleAdd:', e);
            console.error('❌ Error details:', {
                message: e.message,
                stack: e.stack,
                response: e.response
            });
            message.error('Thêm học sinh thất bại!');
        }
    };

    return (
        <div className="admin-form-section" style={{ maxWidth: 700, margin: '0 auto', padding: 32, marginTop: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 className="admin-profile-header" style={{ fontSize: 28, fontWeight: 700, color: '#333', margin: 0, background: 'none', padding: 0, boxShadow: 'none' }}>Thêm học sinh và phụ huynh</h2>
                <Button onClick={() => navigate('/manager-dashboard')} className="admin-btn-primary" style={{ borderRadius: 8, fontWeight: 500 }}>Quay lại danh sách</Button>
            </div>
            <Card className="admin-profile-main-card" style={{ marginBottom: 24 }} bodyStyle={{ padding: '20px' }}>
                <div style={{ color: '#374151', fontWeight: 600, marginBottom: 12, fontSize: '16px' }}>
                    📋 Hướng dẫn nhập thông tin
                </div>
                <div style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>
                    <div>• Họ và tên: 2-50 ký tự, chỉ chữ cái tiếng Việt</div>
                    <div>• Số điện thoại: 10 số, bắt đầu bằng 03, 05, 07, 08, 09</div>
                    <div>• Ngày sinh học sinh: Từ 6 đến 12 tuổi</div>
                    <div>• Ngày sinh phụ huynh: Từ 18 đến 80 tuổi</div>
                    <div>• Địa chỉ: 10-200 ký tự</div>
                    <div>• Có thể chỉ có cha hoặc mẹ hoặc cả hai. Nếu nhập thông tin cha/mẹ thì phải nhập đầy đủ các trường.</div>
                </div>
            </Card>
            <Form
                form={form}
                layout="vertical"
                onFinish={(values) => {
                    console.log('🎯 Form onFinish triggered with values:', values);
                    handleAdd(values);
                }}
                autoComplete="off"
                className="admin-form-section"
            >
                <Card className="admin-profile-main-card" style={{ marginBottom: 24 }} bodyStyle={{ padding: '24px' }}>
                    <div className="admin-form-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', padding: '12px 16px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '8px', color: 'white', fontWeight: '600' }}>
                        <BookOutlined style={{ marginRight: '8px', fontSize: '18px' }} />
                        <Title level={5} style={{ margin: 0, color: 'white' }}>Thông tin học sinh</Title>
                    </div>
                    <Form.Item
                        name="studentName"
                        label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Họ và tên</span>}
                        rules={nameRules}
                    >
                        <Input placeholder="Nhập họ và tên" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                    </Form.Item>
                    <Form.Item
                        name="gender"
                        label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Giới tính</span>}
                        rules={[{ required: true, message: 'Chọn giới tính' }]}
                    >
                        <Select options={genderOptions} placeholder="Chọn giới tính" style={{ borderRadius: '8px' }} />
                    </Form.Item>
                    <Form.Item
                        name="dateOfBirth"
                        label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Ngày sinh</span>}
                        rules={[{
                            required: true,
                            validator: (_, value) => {
                                if (!value) return Promise.reject('Chọn ngày sinh');
                                const age = dayjs().diff(dayjs(value), 'year');
                                if (age < 6 || age > 12) return Promise.reject('Tuổi học sinh phải từ 6-12');
                                return Promise.resolve();
                            }
                        }]}
                    >
                        <DatePicker style={{ width: '100%', borderRadius: '8px', border: '2px solid #e0e7ff' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Địa chỉ</span>}
                        rules={addressRules}
                    >
                        <Input placeholder="Nhập địa chỉ" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                    </Form.Item>
                    <Form.Item
                        name="citizenship"
                        label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Quốc tịch</span>}
                        initialValue="Việt Nam"
                    >
                        <Input placeholder="Quốc tịch" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                    </Form.Item>
                    <Form.Item
                        name="className"
                        label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Lớp học</span>}
                        initialValue="Chưa phân lớp"
                    >
                        <Input placeholder="Nhập lớp học" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                    </Form.Item>
                    <Form.Item
                        name="birthPlace"
                        label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Nơi sinh</span>}
                        initialValue="Chưa xác định"
                    >
                        <Select
                            options={birthPlaceOptions.map(place => ({ value: place, label: place }))}
                            placeholder="Chọn nơi sinh"
                            style={{ borderRadius: '8px' }}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                </Card>
                {/* Father section */}
                <Form.Item noStyle shouldUpdate>
                    {({ getFieldValue }) => {
                        const hasFather = [
                            getFieldValue('fatherFirstName'),
                            getFieldValue('fatherLastName'),
                            getFieldValue('fatherDob'),
                            getFieldValue('fatherGender'),
                            getFieldValue('fatherAddress'),
                            getFieldValue('fatherPhone'),
                            getFieldValue('fatherJobTitle')
                        ].some(Boolean);
                        return (
                            <Card className="admin-profile-main-card" style={{ marginBottom: 24 }} bodyStyle={{ padding: '24px' }}>
                                <div className="admin-form-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', padding: '12px 16px', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', borderRadius: '8px', color: '#d63384', fontWeight: '600' }}>
                                    <UserOutlined style={{ marginRight: '8px', fontSize: '18px' }} />
                                    <Title level={5} style={{ margin: 0, color: '#d63384' }}>Thông tin cha</Title>
                                </div>
                                <Form.Item name="fatherFirstName" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Họ cha</span>} rules={hasFather ? nameRules : []}>
                                    <Input placeholder="Nhập họ cha" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                                </Form.Item>
                                <Form.Item name="fatherLastName" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Tên cha</span>} rules={hasFather ? nameRules : []}>
                                    <Input placeholder="Nhập tên cha" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                                </Form.Item>
                                <Form.Item name="fatherDob" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Ngày sinh cha</span>} rules={hasFather ? [{ required: true, validator: validateParentAge }] : []}>
                                    <DatePicker style={{ width: '100%', borderRadius: '8px', border: '2px solid #e0e7ff' }} format="DD/MM/YYYY" />
                                </Form.Item>
                                <Form.Item name="fatherGender" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Giới tính cha</span>} rules={hasFather ? [{ required: true, message: 'Chọn giới tính cha' }] : []}>
                                    <Select options={genderOptions} placeholder="Chọn giới tính cha" style={{ borderRadius: '8px' }} />
                                </Form.Item>
                                <Form.Item name="fatherAddress" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Địa chỉ cha</span>} rules={hasFather ? addressRules : []}>
                                    <Input placeholder="Nhập địa chỉ cha" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                                </Form.Item>
                                <Form.Item name="fatherPhone" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Số điện thoại cha</span>} rules={hasFather ? phoneRules : []}>
                                    <Input placeholder="Nhập số điện thoại cha" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                                </Form.Item>
                                <Form.Item name="fatherJobTitle" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Nghề nghiệp cha</span>} rules={hasFather ? jobTitleRules : []}>
                                    <Input placeholder="Nhập nghề nghiệp cha" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                                </Form.Item>
                            </Card>
                        );
                    }}
                </Form.Item>
                {/* Mother section */}
                <Form.Item noStyle shouldUpdate>
                    {({ getFieldValue }) => {
                        const hasMother = [
                            getFieldValue('motherFirstName'),
                            getFieldValue('motherLastName'),
                            getFieldValue('motherDob'),
                            getFieldValue('motherGender'),
                            getFieldValue('motherAddress'),
                            getFieldValue('motherPhone'),
                            getFieldValue('motherJobTitle')
                        ].some(Boolean);
                        return (
                            <Card className="admin-profile-main-card" style={{ marginBottom: 24 }} bodyStyle={{ padding: '24px' }}>
                                <div className="admin-form-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', padding: '12px 16px', background: 'linear-gradient(135deg, #fecfef 0%, #f6d365 100%)', borderRadius: '8px', color: '#b8860b', fontWeight: '600' }}>
                                    <UserOutlined style={{ marginRight: '8px', fontSize: '18px' }} />
                                    <Title level={5} style={{ margin: 0, color: '#b8860b' }}>Thông tin mẹ</Title>
                                </div>
                                <Form.Item name="motherFirstName" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Họ mẹ</span>} rules={hasMother ? nameRules : []}>
                                    <Input placeholder="Nhập họ mẹ" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                                </Form.Item>
                                <Form.Item name="motherLastName" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Tên mẹ</span>} rules={hasMother ? nameRules : []}>
                                    <Input placeholder="Nhập tên mẹ" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                                </Form.Item>
                                <Form.Item name="motherDob" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Ngày sinh mẹ</span>} rules={hasMother ? [{ required: true, validator: validateParentAge }] : []}>
                                    <DatePicker style={{ width: '100%', borderRadius: '8px', border: '2px solid #e0e7ff' }} format="DD/MM/YYYY" />
                                </Form.Item>
                                <Form.Item name="motherGender" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Giới tính mẹ</span>} rules={hasMother ? [{ required: true, message: 'Chọn giới tính mẹ' }] : []}>
                                    <Select options={genderOptions} placeholder="Chọn giới tính mẹ" style={{ borderRadius: '8px' }} />
                                </Form.Item>
                                <Form.Item name="motherAddress" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Địa chỉ mẹ</span>} rules={hasMother ? addressRules : []}>
                                    <Input placeholder="Nhập địa chỉ mẹ" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                                </Form.Item>
                                <Form.Item name="motherPhone" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Số điện thoại mẹ</span>} rules={hasMother ? phoneRules : []}>
                                    <Input placeholder="Nhập số điện thoại mẹ" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                                </Form.Item>
                                <Form.Item name="motherJobTitle" label={<span style={{ color: '#374151', fontWeight: '600', fontSize: '15px' }}>Nghề nghiệp mẹ</span>} rules={hasMother ? jobTitleRules : []}>
                                    <Input placeholder="Nhập nghề nghiệp mẹ" style={{ borderRadius: '8px', border: '2px solid #e0e7ff' }} />
                                </Form.Item>
                            </Card>
                        );
                    }}
                </Form.Item>
                <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'center', gap: '16px' }}>
                        <Button
                            onClick={() => navigate('/manager-dashboard')}
                            style={{ height: '45px', padding: '0 32px', borderRadius: '8px', fontSize: '16px', fontWeight: '500', border: '2px solid #d9d9d9', color: '#666', background: 'white' }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="admin-btn-primary"
                            style={{ height: '45px', padding: '0 32px', borderRadius: '8px', fontSize: '16px', fontWeight: '500', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}
                            onClick={() => {
                                console.log('🔘 Submit button clicked!');
                                console.log('📋 Form values:', form.getFieldsValue());
                                console.log('✅ Form is valid:', form.getFieldsError().length === 0);
                                console.log('❌ Form errors:', form.getFieldsError());
                            }}
                        >
                            Thêm
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddStudentsPage; 