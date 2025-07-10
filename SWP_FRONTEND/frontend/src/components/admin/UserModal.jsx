import React, { useEffect } from 'react';
import { Modal, Button, Descriptions, Tag } from 'antd';
import dayjs from 'dayjs';
import RoleSelection from './RoleSelection';
import UserForm from './UserForm';
import { ROLE_LABELS, ROLE_COLORS } from '../../constants/userRoles';

// Helper function to convert LocalDateTime array to dayjs object
const convertLocalDateTimeArray = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
    return null;
  }
  
  try {
    // Array format: [year, month, day, hour, minute, second, nanosecond]
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
    // Note: dayjs month is 0-indexed, but LocalDateTime month is 1-indexed
    return dayjs().year(year).month(month - 1).date(day).hour(hour).minute(minute).second(second);
  } catch (error) {
    console.error('Error converting date array:', error);
    return null;
  }
};

const UserModal = ({
  open,
  onCancel,
  mode,
  selectedUser,
  selectedRole,
  onRoleSelect,
  onSave,
  loading,
  users,
  form,
  isFormMounted
}) => {
  // Removed unused currentPassword state as it's not needed in this refactored version
  
  useEffect(() => {
    // Reset any state when modal closes
    if (!open) {
      // Modal closed
    }
  }, [open]);

  const getModalTitle = () => {
    switch (mode) {
      case 'add':
        return selectedRole ? `Thêm ${ROLE_LABELS[selectedRole]}` : 'Chọn vai trò';
      case 'view':
        return 'Thông tin người dùng';
      case 'edit':
        return 'Chỉnh sửa người dùng';
      default:
        return 'Quản lý người dùng';
    }
  };

  const getModalFooter = () => {
    if (mode === 'view') {
      return [
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>
      ];
    }

    if (mode === 'add' && !selectedRole) {
      return [
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>
      ];
    }

    return [
      
      <Button 
        key="cancel" 
        onClick={() => {
          if (mode === 'add' && selectedRole) {
            onRoleSelect(''); // Go back to role selection
            if (isFormMounted && form) {
              try {
                form.resetFields();
              } catch (error) {
                console.warn('Error resetting form:', error);
              }
            }
          } else {
            onCancel();
          }
        }}
      >
        {mode === 'add' && selectedRole ? 'Quay lại' : 'Hủy'}
      </Button>,
      <Button
        key="save"
        type="primary"
        onClick={onSave}
        loading={loading}
      >
        {mode === 'add' ? 'Thêm' : 'Cập nhật'}
      </Button>
    ];
  };

  const renderModalContent = () => {
    if (mode === 'view') {
      return (
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="ID hệ thống" span={1}>
            {selectedUser?.id}
          </Descriptions.Item>
          <Descriptions.Item label="Họ" span={1}>
            {selectedUser?.firstName || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Tên" span={1}>
            {selectedUser?.lastName || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={1}>
            {selectedUser?.email || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại" span={1}>
            {selectedUser?.phone || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh" span={1}>
            {selectedUser?.dob
              ? dayjs(selectedUser.dob).format("DD/MM/YYYY")
              : "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính" span={1}>
            {selectedUser?.gender === "M"
              ? "Nam"
              : selectedUser?.gender === "F"
              ? "Nữ"
              : "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Tên đăng nhập" span={1}>
            {selectedUser?.username || "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò" span={1}>
            <Tag color={ROLE_COLORS[selectedUser?.roleName] || 'default'}>
              {ROLE_LABELS[selectedUser?.roleName] || 'Chưa xác định'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={1}>
            <Tag color={selectedUser?.enabled ? "success" : "error"}>
              {selectedUser?.enabled ? "Hoạt động" : "Không hoạt động"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={1}>
            {(() => {
              const createdDate = convertLocalDateTimeArray(selectedUser?.createdAt || selectedUser?.createdDate);
              return createdDate ? createdDate.format("HH:mm DD/MM/YYYY") : "Chưa cập nhật";
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {selectedUser?.address && selectedUser.address.trim() !== ""
              ? selectedUser.address
              : "Chưa cập nhật"}
          </Descriptions.Item>
        </Descriptions>
      );
    }

    if (mode === 'add' && !selectedRole) {
      return <RoleSelection onRoleSelect={onRoleSelect} />;
    }

    return (
      <UserForm
        form={form}
        selectedRole={selectedRole}
        modalMode={mode}
        existingUsers={users}
        currentUser={selectedUser}
      />
    );
  };

  return (
    <Modal
      title={getModalTitle()}
      open={open}
      onCancel={onCancel}
      footer={getModalFooter()}
      width={900}
      destroyOnClose
    >
      {renderModalContent()}
    </Modal>
  );
};

export default UserModal;
