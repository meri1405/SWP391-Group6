import { useState, useCallback, useEffect } from 'react';
import { Form, message, notification } from 'antd';
import { getAllUsers, createUser, toggleUserStatus } from '../api/adminApi';
import { USER_ROLES } from '../constants/userRoles';

/**
 * Custom hook for user management functionality
 */
export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRoleForNewUser, setSelectedRoleForNewUser] = useState('');
  const [isUserFormMounted, setIsUserFormMounted] = useState(false);
  
  const [userFormInstance] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || user.roleName === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Debug logging
  console.log('Current users array:', users);
  console.log('Search term:', searchTerm);
  console.log('Filter role:', filterRole);
  console.log('Filtered users:', filteredUsers);

  // Reset user form
  const resetUserForm = useCallback(() => {
    if (!isUserFormMounted || !userFormInstance) {
      return;
    }

    try {
      userFormInstance.resetFields();
      const initialValues = {
        role: 'SCHOOLNURSE',
        email: '',
        jobTitle: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        gender: undefined,
        dob: null,
        status: 'ACTIVE',
      };
      userFormInstance.setFieldsValue(initialValues);
    } catch (error) {
      console.warn('Error resetting form:', error);
    }
  }, [isUserFormMounted, userFormInstance]);

  // Load all users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      console.log('Users data received in hook:', data);
      console.log('Is array:', Array.isArray(data));
      
      if (Array.isArray(data)) {
        setUsers(data);
        console.log('Users set successfully:', data.length, 'users');
      } else {
        console.error('Data is not an array:', data);
        message.error('Định dạng dữ liệu người dùng không hợp lệ');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      message.error('Có lỗi xảy ra khi tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Open add user modal
  const openAddUserModal = useCallback(() => {
    setModalMode('add');
    setSelectedUser(null);
    setSelectedRoleForNewUser('');
    setShowUserModal(true);
  }, []);

  // Open view user modal
  const openViewUserModal = useCallback((user) => {
    setModalMode('view');
    setSelectedUser(user);
    setShowUserModal(true);
  }, []);

  // Handle role selection for new user
  const handleRoleSelection = useCallback((role) => {
    setSelectedRoleForNewUser(role);
    if (userFormInstance) {
      userFormInstance.setFieldsValue({ role });
    }
  }, [userFormInstance]);

  // Handle user save (create/update)
  const handleSaveUser = useCallback(async () => {
    if (!userFormInstance) return;

    try {
      const values = await userFormInstance.validateFields();
      setLoading(true);

      if (modalMode === 'add') {
        const userData = {
          ...values,
          role: selectedRoleForNewUser,
        };

        const response = await createUser(userData);
        
        if (response?.success) {
          message.success('Thêm người dùng thành công!');
          setShowUserModal(false);
          setSelectedRoleForNewUser('');
          resetUserForm();
          await loadUsers();
        } else {
          message.error(response?.message || 'Có lỗi xảy ra khi thêm người dùng');
        }
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin đã nhập');
      } else {
        console.error('Error saving user:', error);
        message.error('Có lỗi xảy ra khi lưu thông tin người dùng');
      }
    } finally {
      setLoading(false);
    }
  }, [modalMode, selectedRoleForNewUser, userFormInstance, loadUsers, resetUserForm]);

  // Handle delete/toggle user status
  const handleDeleteUser = useCallback(async (user) => {
    try {
      setLoading(true);
      const response = await toggleUserStatus(user.id);
      
      if (response?.success) {
        const action = user.enabled ? 'vô hiệu hóa' : 'kích hoạt lại';
        message.success(`${action} người dùng thành công!`);
        await loadUsers();
      } else {
        message.error(response?.message || 'Có lỗi xảy ra khi thay đổi trạng thái người dùng');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      message.error('Có lỗi xảy ra khi thay đổi trạng thái người dùng');
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Close modal handler
  const closeModal = useCallback(() => {
    setShowUserModal(false);
    setSelectedRoleForNewUser('');
    setIsUserFormMounted(false);
  }, []);

  // Effects for modal state management
  useEffect(() => {
    if (showUserModal && modalMode === 'add') {
      const timer = setTimeout(() => {
        setIsUserFormMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsUserFormMounted(false);
    }
  }, [showUserModal, modalMode]);

  useEffect(() => {
    if (isUserFormMounted && modalMode === 'add' && !selectedRoleForNewUser) {
      const timer = setTimeout(() => {
        resetUserForm();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isUserFormMounted, modalMode, selectedRoleForNewUser, resetUserForm]);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
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
    setShowUserModal: closeModal,
    openAddUserModal,
    openViewUserModal,
    handleRoleSelection,
    handleSaveUser,
    handleDeleteUser,
    loadUsers,
    resetUserForm,
  };
};
