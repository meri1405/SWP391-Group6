import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import UserSearchAndFilter from './UserSearchAndFilter';
import UserTable from './UserTable';
import UserModal from './UserModal';
import { useUserManagement } from '../../hooks/useUserManagement';
import '../../styles/AdminComponents.css';

const UserManagement = () => {
  const {
    // State
    users,
    filteredUsers,
    loading,
    searchTerm,
    filterRole,
    showUserModal,
    selectedUser,
    modalMode,
    selectedRoleForNewUser,
    isUserFormMounted,
    userFormInstance,
    contextHolder,

    // Actions
    setSearchTerm,
    setFilterRole,
    setShowUserModal,
    openAddUserModal,
    openViewUserModal,
    handleRoleSelection,
    handleSaveUser,
    handleDeleteUser,
  } = useUserManagement();

  return (
    <>
      {contextHolder}
      <div className="user-management">
        <div className="section-header">
          <h2>Quản lý người dùng</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddUserModal}
            size="large"
          >
            Thêm người dùng
          </Button>
        </div>

        <UserSearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
          totalUsers={users.length}
          filteredCount={filteredUsers.length}
        />

        <UserTable
          users={filteredUsers}
          onViewUser={openViewUserModal}
          onToggleUserStatus={handleDeleteUser}
          loading={loading}
        />

        <UserModal
          open={showUserModal}
          onCancel={setShowUserModal}
          mode={modalMode}
          selectedUser={selectedUser}
          selectedRole={selectedRoleForNewUser}
          onRoleSelect={handleRoleSelection}
          onSave={handleSaveUser}
          loading={loading}
          users={users}
          form={userFormInstance}
          isFormMounted={isUserFormMounted}
        />
      </div>
    </>
  );
};

export default UserManagement;
