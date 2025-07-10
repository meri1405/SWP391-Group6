import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { 
  validateVietnameseName, 
  validateVietnamesePhone, 
  validateEmail, 
  validateAddress
} from '../../utils/formValidation';
import { getMaxAgeForRole, ROLE_LABELS, getJobTitleForRole } from '../../constants/userRoles';

const UserForm = ({ 
  form, 
  selectedRole, 
  modalMode = 'add',
  existingUsers = [] 
}) => {
  
  // Check for duplicate values
  const checkDuplicate = (value, field, currentUserId = null) => {
    return existingUsers.some(user => 
      user[field] === value && user.id !== currentUserId
    );
  };

  // Age validation based on role (minimum 25 years old)
  const validateAge = (_, value) => {
    if (!value) return Promise.resolve();

    const today = new Date();
    const birthDate = new Date(value);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (birthDate > today) {
      return Promise.reject(new Error('Ngày sinh không thể trong tương lai!'));
    }

    // Minimum age requirement is 25
    const minAge = 25;
    const maxAge = getMaxAgeForRole(selectedRole);

    if (age < minAge) {
      return Promise.reject(
        new Error(`Tuổi tối thiểu phải từ ${minAge} tuổi trở lên!`)
      );
    }

    if (age > maxAge) {
      return Promise.reject(
        new Error(`Tuổi không được vượt quá ${maxAge} tuổi!`)
      );
    }

    return Promise.resolve();
  };

  // Phone validation with duplicate check
  const validatePhoneWithDuplicate = (_, value) => {
    const phoneValidation = validateVietnamesePhone(value);
    if (!phoneValidation.isValid) {
      return Promise.reject(new Error(phoneValidation.message));
    }

    if (modalMode === 'add' && checkDuplicate(value, 'phone')) {
      return Promise.reject(new Error('Số điện thoại này đã được sử dụng!'));
    }

    return Promise.resolve();
  };

  // Email validation with duplicate check
  const validateEmailWithDuplicate = (_, value) => {
    const emailValidation = validateEmail(value);
    if (!emailValidation.isValid) {
      return Promise.reject(new Error(emailValidation.message));
    }

    if (modalMode === 'add' && checkDuplicate(value, 'email')) {
      return Promise.reject(new Error('Email này đã được sử dụng!'));
    }

    return Promise.resolve();
  };

  // Name validation
  const validateName = (_, value) => {
    const validation = validateVietnameseName(value);
    if (!validation.isValid) {
      return Promise.reject(new Error(validation.message));
    }
    return Promise.resolve();
  };

  // Address validation
  const validateAddressField = (_, value) => {
    const validation = validateAddress(value);
    if (!validation.isValid) {
      return Promise.reject(new Error(validation.message));
    }
    return Promise.resolve();
  };

  // Only allow numbers for phone input
  const handlePhoneKeyPress = (e) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Auto-set jobTitle based on selectedRole
  useEffect(() => {
    if (form && selectedRole) {
      const jobTitle = getJobTitleForRole(selectedRole);
      form.setFieldsValue({ jobTitle });
    }
  }, [form, selectedRole]);

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          role: selectedRole,
          email: '',
          jobTitle: getJobTitleForRole(selectedRole),
          firstName: '',
          lastName: '',
          phone: '',
          address: '',
          gender: undefined,
          dob: null,
          status: 'ACTIVE'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Last Name */}
          <Form.Item
            label="Họ"
            name="lastName"
            rules={[
              { required: true, message: 'Vui lòng nhập họ!' },
              { validator: validateName }
            ]}
          >
            <Input placeholder="Nhập họ" autoComplete="off" />
          </Form.Item>

          {/* First Name */}
          <Form.Item
            label="Tên"
            name="firstName"
            rules={[
              { required: true, message: 'Vui lòng nhập tên!' },
              { validator: validateName }
            ]}
          >
            <Input placeholder="Nhập tên" autoComplete="off" />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { validator: validatePhoneWithDuplicate }
            ]}
          >
            <Input
              placeholder="Nhập số điện thoại (VD: 0901234567)"
              maxLength={10}
              autoComplete="off"
              onKeyPress={handlePhoneKeyPress}
            />
          </Form.Item>

          {/* Date of Birth */}
          <Form.Item
            label="Ngày sinh"
            name="dob"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày sinh!' },
              { validator: validateAge }
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Chọn ngày sinh"
              format="DD/MM/YYYY"
              defaultPickerValue={dayjs().subtract(25, 'year')}
              disabledDate={(current) => {
                if (!current) return false;
                
                // Disable future dates
                if (current > dayjs().endOf('day')) return true;
                
                // Calculate minimum date for 25 years old
                const minDate = dayjs().subtract(25, 'year');
                
                // Disable dates that would make person younger than 25
                return current > minDate;
              }}
            />
          </Form.Item>

          {/* Gender */}
          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
          >
            <Select placeholder="Chọn giới tính">
              <Select.Option value="M">Nam</Select.Option>
              <Select.Option value="F">Nữ</Select.Option>
            </Select>
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { validator: validateEmailWithDuplicate }
            ]}
          >
            <Input 
              placeholder="Nhập email" 
              autoComplete="off" 
              type="email"
            />
          </Form.Item>

          {/* Hidden role field */}
          <Form.Item name="role" style={{ display: 'none' }}>
            <Input />
          </Form.Item>

          {/* Hidden job title field - auto-set based on role */}
          <Form.Item name="jobTitle" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
        </div>

        {/* Address */}
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[
            { required: true, message: 'Vui lòng nhập địa chỉ!' },
            { validator: validateAddressField }
          ]}
        >
          <Input.TextArea
            placeholder="Nhập địa chỉ đầy đủ (VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM)"
            rows={3}
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </>
  );
};

export default UserForm;
