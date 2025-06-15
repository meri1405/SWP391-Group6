import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout, Menu, Breadcrumb, Spin, message, notification } from "antd";
import { useAuth } from "../contexts/AuthContext";
import dayjs from "dayjs";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Descriptions,
  Tag,
  Space,
  Popconfirm,
  Card,
  Divider,
  DatePicker,
  Upload,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloseOutlined,
  SaveOutlined,
  LeftOutlined,
  RightOutlined,
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  HomeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import "../styles/Profile.css";
import "../styles/SidebarTrigger.css";
import "../styles/AdminDashboard.css";
// Import API functions
import {
  getAllUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  getAdminProfile,
  updateAdminProfile,
} from "../api/adminApi";
import { useSystemSettings } from "../contexts/SystemSettingsContext";

const { Header, Sider, Content } = Layout;

// Validation helper functions
const validateVietnamesePhoneNumber = (phone) => {
  const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  return phoneRegex.test(phone);
};

const validateVietnameseName = (name) => {
  const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
  return nameRegex.test(name) && name.trim() === name && !/\s{2,}/.test(name);
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && !email.includes(" ");
};

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  return (
    usernameRegex.test(username) &&
    username.length >= 3 &&
    username.length <= 30
  );
};

const validatePassword = (password) => {
  if (!password) return false;

  // Kiểm tra độ dài và khoảng trắng
  const hasValidLength = password.length >= 8 && password.length <= 50;
  const noSpaces = !password.includes(" ");

  if (!hasValidLength || !noSpaces) return false;

  // Tính score dựa trên các tiêu chí
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;

  // Chấp nhận mật khẩu từ "Trung bình" trở lên (score >= 3)
  return score >= 3;
};

// Helper function to check password strength
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, text: "", color: "" };

  let score = 0;
  let feedback = [];

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push("ít nhất 8 ký tự");

  // Lowercase check
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("chữ thường");

  // Uppercase check
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("chữ hoa");

  // Number check
  if (/\d/.test(password)) score += 1;
  else feedback.push("số");

  // Special character check
  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push("ký tự đặc biệt");

  const strengthLevels = [
    { text: "Rất yếu", color: "#ff4d4f" },
    { text: "Yếu", color: "#ff7a45" },
    { text: "Trung bình", color: "#ffa940" },
    { text: "Khá", color: "#52c41a" },
    { text: "Mạnh", color: "#389e0d" },
  ];

  return {
    score,
    text: strengthLevels[score] ? strengthLevels[score].text : "Rất yếu",
    color: strengthLevels[score] ? strengthLevels[score].color : "#ff4d4f",
    feedback:
      score >= 3
        ? score === 5
          ? "Mật khẩu mạnh!"
          : "Mật khẩu đạt yêu cầu!"
        : `Cần thêm: ${feedback.join(", ")}`,
  };
};

// User Management Component - moved outside main component
const UserManagement = ({
  filteredUsers,
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  users,
  openAddUserModal,
  openViewUserModal,
  handleDeleteUser,
  showUserModal,
  setShowUserModal,
  modalMode,
  selectedUser,
  handleSaveUser,
  userFormInstance,
  handleRoleChange,
  loading,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  return (
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
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-search">Tìm kiếm</button>
        </div>

        <div className="filter-bar">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="SCHOOLNURSE">Y tá</option>
            <option value="MANAGER">Quản lý</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </div>
      </div>
      <div className="users-stats">
        <span>
          Hiển thị {filteredUsers.length} / {users.length} người dùng
        </span>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Tên đăng nhập</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id || user.userId || `user-${index}`}>
                <td>{index + 1}</td>
                <td>{user.lastName || ""}</td>
                <td>{user.firstName || ""}</td>
                <td>{user.email || "-"}</td>
                <td>{user.username || "-"}</td>
                <td>{user.phone || "-"}</td>
                <td>
                  <span
                    className={`role-badge ${user.roleName?.toLowerCase()}`}
                  >
                    {user.roleName}
                  </span>
                </td>
                <td>
                  <span
                    className={`status ${user.enabled ? "active" : "inactive"}`}
                  >
                    {user.enabled ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                    : "N/A"}
                </td>
                <td>
                  <Space size="small">
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => openViewUserModal(user)}
                      title="Xem chi tiết"
                    />
                    <Popconfirm
                      title="Xác nhận thay đổi trạng thái"
                      description={`Bạn có muốn ${
                        user.enabled ? "vô hiệu hóa" : "kích hoạt lại"
                      } người dùng ${user.firstName} ${user.lastName}?`}
                      onConfirm={() => handleDeleteUser(user)}
                      okText={user.enabled ? "Vô hiệu hóa" : "Kích hoạt"}
                      cancelText="Hủy"
                      okType={user.enabled ? "danger" : "primary"}
                    >
                      <Button
                        type={user.enabled ? "primary" : "default"}
                        danger={user.enabled}
                        icon={
                          user.enabled ? <CloseOutlined /> : <SaveOutlined />
                        }
                        size="small"
                        title={user.enabled ? "Vô hiệu hóa" : "Kích hoạt lại"}
                      />
                    </Popconfirm>
                  </Space>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="no-data">
            <p>Không tìm thấy người dùng nào phù hợp với tiêu chí tìm kiếm.</p>
          </div>
        )}
      </div>
      {/* User Modal */}
      <Modal
        title={
          modalMode === "add"
            ? "Thêm người dùng mới"
            : modalMode === "view"
            ? "Thông tin người dùng"
            : "Chỉnh sửa người dùng"
        }
        open={showUserModal}
        onCancel={() => {
          setShowUserModal(false);
          setCurrentPassword("");
        }}
        footer={
          modalMode === "view"
            ? [
                <Button
                  key="view-close"
                  onClick={() => setShowUserModal(false)}
                >
                  Đóng
                </Button>,
              ]
            : [
                <Button
                  key="form-cancel"
                  onClick={() => setShowUserModal(false)}
                >
                  Hủy
                </Button>,
                <Button
                  key="form-submit"
                  type="primary"
                  onClick={handleSaveUser}
                  loading={loading}
                >
                  {modalMode === "add" ? "Thêm" : "Cập nhật"}
                </Button>,
              ]
        }
        width={900}
        destroyOnHidden
      >
        {modalMode === "view" ? (
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
            {/* Role-specific fields */}
            {(selectedUser?.roleName === "SCHOOLNURSE" ||
              selectedUser?.role === "SCHOOLNURSE" ||
              selectedUser?.roleName === "MANAGER" ||
              selectedUser?.role === "MANAGER" ||
              selectedUser?.roleName === "ADMIN" ||
              selectedUser?.role === "ADMIN") && (
              <>
                <Descriptions.Item label="Email" span={1}>
                  {selectedUser?.email || "Chưa cập nhật"}
                </Descriptions.Item>
                <Descriptions.Item label="Tên đăng nhập" span={1}>
                  {selectedUser?.username || "Chưa cập nhật"}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Vai trò" span={1}>
              <Tag
                color={
                  selectedUser?.roleName === "SCHOOLNURSE" ||
                  selectedUser?.role === "SCHOOLNURSE"
                    ? "purple"
                    : selectedUser?.roleName === "MANAGER" ||
                      selectedUser?.role === "MANAGER"
                    ? "orange"
                    : "red"
                }
              >
                {(selectedUser?.roleName === "SCHOOLNURSE" ||
                  selectedUser?.role === "SCHOOLNURSE") &&
                  "Y tá"}
                {(selectedUser?.roleName === "MANAGER" ||
                  selectedUser?.role === "MANAGER") &&
                  "Quản lý"}
                {(selectedUser?.roleName === "ADMIN" ||
                  selectedUser?.role === "ADMIN") &&
                  "Quản trị viên"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag color={selectedUser?.enabled ? "success" : "error"}>
                {selectedUser?.enabled ? "Hoạt động" : "Không hoạt động"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={1}>
              {selectedUser?.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              {selectedUser?.address && selectedUser.address.trim() !== ""
                ? selectedUser.address
                : "Chưa cập nhật"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div>
            {/* Validation Guidelines */}
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: "8px",
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", color: "#389e0d" }}>
                📋 Hướng dẫn nhập thông tin
              </h4>
              <div style={{ fontSize: "13px", color: "#52c41a" }}>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Thông tin bắt buộc cho tất cả vai trò:</strong>
                  <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                    <li>Họ và tên: 2-50 ký tự, chỉ chữ cái tiếng Việt</li>
                    <li>
                      Số điện thoại: 10 số, bắt đầu bằng 03, 05, 07, 08, 09
                    </li>
                    <li>Ngày sinh: Tuổi từ 16-100</li>
                    <li>Địa chỉ: 10-200 ký tự</li>
                  </ul>
                </div>
                <div>
                  <strong>Thông tin bổ sung theo vai trò:</strong>
                  <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                    <li>
                      <strong>Y tá/Quản lý/Admin:</strong> Email, tên đăng nhập
                      (3-30 ký tự), mật khẩu độ mạnh từ 'Trung bình' trở lên (8+
                      ký tự)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Form
              form={userFormInstance}
              layout="vertical"
              initialValues={{
                role: "SCHOOLNURSE",
                username: "",
                password: "",
                email: "",
                jobTitle: "",
                firstName: "",
                lastName: "",
                phone: "",
                address: "",
                gender: "",
                dob: null,
                status: "ACTIVE",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <Form.Item
                  label="Họ"
                  name="lastName"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ!" },
                    { min: 2, message: "Họ phải có ít nhất 2 ký tự!" },
                    { max: 50, message: "Họ không được quá 50 ký tự!" },
                    {
                      pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                      message: "Họ chỉ được chứa chữ cái và khoảng trắng!",
                    },
                    {
                      validator: (_, value) => {
                        if (value && value.trim() !== value) {
                          return Promise.reject(
                            new Error(
                              "Không được có khoảng trắng thừa ở đầu hoặc cuối!"
                            )
                          );
                        }
                        if (value && /\s{2,}/.test(value)) {
                          return Promise.reject(
                            new Error(
                              "Không được có nhiều khoảng trắng liên tiếp!"
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input placeholder="Nhập họ" autoComplete="off" />
                </Form.Item>
                <Form.Item
                  label="Tên"
                  name="firstName"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên!" },
                    { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
                    { max: 50, message: "Tên không được quá 50 ký tự!" },
                    {
                      pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                      message: "Tên chỉ được chứa chữ cái và khoảng trắng!",
                    },
                    {
                      validator: (_, value) => {
                        if (value && value.trim() !== value) {
                          return Promise.reject(
                            new Error(
                              "Không được có khoảng trắng thừa ở đầu hoặc cuối!"
                            )
                          );
                        }
                        if (value && /\s{2,}/.test(value)) {
                          return Promise.reject(
                            new Error(
                              "Không được có nhiều khoảng trắng liên tiếp!"
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên" autoComplete="off" />
                </Form.Item>
                {/* Phone field - required for all remaining roles */}
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số điện thoại!",
                    },
                    {
                      pattern: /^(0[3|5|7|8|9])[0-9]{8}$/,
                      message:
                        "Số điện thoại không hợp lệ! (Ví dụ: 0901234567)",
                    },
                    {
                      validator: (_, value) => {
                        if (value && value.length !== 10) {
                          return Promise.reject(
                            new Error("Số điện thoại phải có đúng 10 chữ số!")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập số điện thoại (VD: 0901234567)"
                    maxLength={10}
                    autoComplete="off"
                    onKeyPress={(e) => {
                      // Only allow numbers
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Ngày sinh"
                  name="dob"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh!" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();

                        const today = new Date();
                        const birthDate = new Date(value);
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff =
                          today.getMonth() - birthDate.getMonth();

                        if (
                          monthDiff < 0 ||
                          (monthDiff === 0 &&
                            today.getDate() < birthDate.getDate())
                        ) {
                          age--;
                        }

                        if (birthDate > today) {
                          return Promise.reject(
                            new Error(
                              "Ngày sinh không thể lớn hơn ngày hiện tại!"
                            )
                          );
                        }

                        if (age < 16) {
                          return Promise.reject(
                            new Error("Tuổi phải từ 16 trở lên!")
                          );
                        }

                        if (age > 100) {
                          return Promise.reject(
                            new Error("Tuổi không thể lớn hơn 100!")
                          );
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Chọn ngày sinh"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      // Disable future dates and dates more than 100 years ago
                      return (
                        current &&
                        (current > new Date() ||
                          current <
                            new Date().setFullYear(
                              new Date().getFullYear() - 100
                            ))
                      );
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Giới tính"
                  name="gender"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính!" },
                  ]}
                >
                  <Select placeholder="Chọn giới tính">
                    <Select.Option key="M" value="M">
                      Nam
                    </Select.Option>
                    <Select.Option key="F" value="F">
                      Nữ
                    </Select.Option>
                  </Select>
                </Form.Item>

                {/* Conditional email field - only show for nurse, manager and admin roles */}
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.role !== currentValues.role
                  }
                >
                  {({ getFieldValue }) => {
                    const selectedRole = getFieldValue("role");
                    return selectedRole === "SCHOOLNURSE" ||
                      selectedRole === "MANAGER" ||
                      selectedRole === "ADMIN" ? (
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email!" },
                          { type: "email", message: "Email không hợp lệ!" },
                          {
                            max: 100,
                            message: "Email không được quá 100 ký tự!",
                          },
                          {
                            pattern:
                              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Định dạng email không hợp lệ!",
                          },
                          {
                            validator: (_, value) => {
                              if (value && value.trim() !== value) {
                                return Promise.reject(
                                  new Error(
                                    "Email không được có khoảng trắng ở đầu hoặc cuối!"
                                  )
                                );
                              }
                              if (value && value.includes(" ")) {
                                return Promise.reject(
                                  new Error(
                                    "Email không được chứa khoảng trắng!"
                                  )
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input placeholder="Nhập email" autoComplete="off" />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                {/* Conditional username field - only show for nurse, manager and admin roles */}
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.role !== currentValues.role
                  }
                >
                  {({ getFieldValue }) => {
                    const selectedRole = getFieldValue("role");
                    return selectedRole === "SCHOOLNURSE" ||
                      selectedRole === "MANAGER" ||
                      selectedRole === "ADMIN" ? (
                      <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên đăng nhập!",
                          },
                          {
                            min: 3,
                            message: "Tên đăng nhập phải có ít nhất 3 ký tự!",
                          },
                          {
                            max: 30,
                            message: "Tên đăng nhập không được quá 30 ký tự!",
                          },
                          {
                            pattern: /^[a-zA-Z0-9_]+$/,
                            message:
                              "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới!",
                          },
                          {
                            pattern: /^[a-zA-Z]/,
                            message: "Tên đăng nhập phải bắt đầu bằng chữ cái!",
                          },
                          {
                            validator: (_, value) => {
                              if (value && value.includes(" ")) {
                                return Promise.reject(
                                  new Error(
                                    "Tên đăng nhập không được chứa khoảng trắng!"
                                  )
                                );
                              }
                              if (value && /^[0-9]/.test(value)) {
                                return Promise.reject(
                                  new Error(
                                    "Tên đăng nhập không được bắt đầu bằng số!"
                                  )
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input
                          placeholder="Nhập tên đăng nhập"
                          autoComplete="off"
                        />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                {/* Conditional password field - only show for nurse, manager and admin roles */}
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.role !== currentValues.role
                  }
                >
                  {({ getFieldValue }) => {
                    const selectedRole = getFieldValue("role");
                    return selectedRole === "SCHOOLNURSE" ||
                      selectedRole === "MANAGER" ||
                      selectedRole === "ADMIN" ? (
                      <Form.Item
                        label={
                          modalMode === "edit"
                            ? "Mật khẩu mới (để trống nếu không đổi)"
                            : "Mật khẩu"
                        }
                        name="password"
                        rules={[
                          {
                            required: modalMode === "add",
                            message: "Vui lòng nhập mật khẩu!",
                          },
                          {
                            min: 8,
                            message: "Mật khẩu phải có ít nhất 8 ký tự!",
                          },
                          {
                            max: 50,
                            message: "Mật khẩu không được quá 50 ký tự!",
                          },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();

                              if (value.includes(" ")) {
                                return Promise.reject(
                                  new Error(
                                    "Mật khẩu không được chứa khoảng trắng!"
                                  )
                                );
                              }

                              if (value.trim() !== value) {
                                return Promise.reject(
                                  new Error(
                                    "Mật khẩu không được có khoảng trắng ở đầu hoặc cuối!"
                                  )
                                );
                              }

                              if (!validatePassword(value)) {
                                return Promise.reject(
                                  new Error(
                                    "Mật khẩu phải đạt độ mạnh 'Trung bình' trở lên (cần ít nhất 3/5 tiêu chí: chữ thường, chữ hoa, số, ký tự đặc biệt)!"
                                  )
                                );
                              }

                              return Promise.resolve();
                            },
                          },
                        ]}
                        hasFeedback
                      >
                        <div>
                          <Input.Password
                            placeholder={
                              modalMode === "edit"
                                ? "Để trống nếu không đổi mật khẩu"
                                : "Nhập mật khẩu"
                            }
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            autoComplete="new-password"
                          />
                          {currentPassword && modalMode === "add" && (
                            <div style={{ marginTop: "8px" }}>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#666",
                                }}
                              >
                                {getPasswordStrength(currentPassword).feedback}
                              </div>
                            </div>
                          )}
                        </div>
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
                <Form.Item
                  label="Vai trò"
                  name="role"
                  rules={[
                    { required: true, message: "Vui lòng chọn vai trò!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn vai trò"
                    onChange={(value) =>
                      handleRoleChange(value, userFormInstance)
                    }
                  >
                    <Select.Option key="SCHOOLNURSE" value="SCHOOLNURSE">
                      Y tá
                    </Select.Option>
                    <Select.Option key="MANAGER" value="MANAGER">
                      Quản lý
                    </Select.Option>
                    <Select.Option key="ADMIN" value="ADMIN">
                      Quản trị viên
                    </Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ!" },
                  { min: 10, message: "Địa chỉ phải có ít nhất 10 ký tự!" },
                  { max: 200, message: "Địa chỉ không được quá 200 ký tự!" },
                  {
                    pattern: /^[a-zA-ZÀ-ỹ0-9\s.,/\-()]+$/,
                    message:
                      "Địa chỉ chỉ được chứa chữ cái, số và các ký tự . , / - ( )",
                  },
                  {
                    validator: (_, value) => {
                      if (value && value.trim() !== value) {
                        return Promise.reject(
                          new Error(
                            "Không được có khoảng trắng thừa ở đầu hoặc cuối!"
                          )
                        );
                      }
                      if (value && /\s{3,}/.test(value)) {
                        return Promise.reject(
                          new Error(
                            "Không được có quá 2 khoảng trắng liên tiếp!"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
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
          </div>
        )}
      </Modal>
    </div>
  );
};

// Admin Profile Component - moved outside main component
const AdminProfile = ({ userInfo: initialUserInfo, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [adminProfile, setAdminProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    jobTitle: "",
    username: "",
    dob: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch admin profile data from API
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        console.log("Fetching admin profile from database...");

        const profileData = await getAdminProfile();
        console.log("Full admin profile data from API:", profileData);

        setAdminProfile(profileData);

        // Update form data with all available information
        setFormData({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          jobTitle: profileData.jobTitle || "Quản trị viên",
          username: profileData.username || "",
          dob: profileData.dob || profileData.dateOfBirth || "",
          gender: profileData.gender || "",
        });

        console.log("Updated formData with profile:", {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
          jobTitle: profileData.jobTitle,
          username: profileData.username,
          dob: profileData.dob || profileData.dateOfBirth,
          gender: profileData.gender,
        });
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        message.error(
          "Không thể tải thông tin admin. Sử dụng thông tin từ context."
        );

        // Fallback to initial userInfo if API fails
        if (initialUserInfo) {
          setFormData({
            firstName: initialUserInfo.firstName || "",
            lastName: initialUserInfo.lastName || "",
            email: initialUserInfo.email || "",
            phone: initialUserInfo.phone || "",
            address: initialUserInfo.address || "",
            jobTitle: initialUserInfo.jobTitle || "Quản trị viên",
            username: initialUserInfo.username || "",
            dob: initialUserInfo.dob || "",
            gender: initialUserInfo.gender || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [initialUserInfo]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Tên không được để trống";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Họ không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (
      formData.phone &&
      !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        jobTitle: formData.jobTitle,
        dob: formData.dob,
        gender: formData.gender,
      };

      console.log("Updating admin profile with:", updateData);

      const updatedProfile = await updateAdminProfile(updateData);
      console.log("Profile updated successfully:", updatedProfile);

      // Update local state with new data
      setAdminProfile(updatedProfile);

      // Notify parent component to refresh user list
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }

      message.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating admin profile:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ có thể upload file JPG/PNG!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      setAvatarUrl(info.file.response?.url);
      setLoading(false);
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  // Show loading spinner while fetching data
  if (loading && !adminProfile) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <Spin size="large" />
        <span style={{ marginLeft: "16px" }}>Đang tải thông tin admin...</span>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-content">
          <h2>
            <UserOutlined /> Hồ Sơ Cá Nhân
          </h2>
          <p>Quản lý thông tin tài khoản quản trị viên</p>
        </div>
        <Button
          type={isEditing ? "default" : "primary"}
          icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
          onClick={() => setIsEditing(!isEditing)}
          size="large"
        >
          {isEditing ? "Hủy" : "Chỉnh sửa"}
        </Button>
      </div>

      <div className="profile-content">
        <Card
          className="profile-main-card"
          title="Thông tin cá nhân"
          styles={{ body: { padding: "24px" } }}
        >
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  <UserOutlined style={{ fontSize: 48 }} />
                </div>
              )}
            </div>
            {isEditing && (
              <Button icon={<UploadOutlined />} size="small">
                Đổi ảnh
              </Button>
            )}

            <div className="profile-basic-info">
              <h3>
                {formData.lastName} {formData.firstName}
              </h3>
              <Tag color="red" icon={<SettingOutlined />}>
                Quản trị viên
              </Tag>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "error" : ""}
                    required
                  />
                  {errors.lastName && (
                    <span className="error-text">{errors.lastName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Tên *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "error" : ""}
                    required
                  />
                  {errors.firstName && (
                    <span className="error-text">{errors.firstName}</span>
                  )}
                </div>
              </div>

              <div className="form-section">
                <h4>Thông tin tài khoản</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                      placeholder="admin@example.com"
                    />
                    {errors.email && (
                      <span className="error-text">{errors.email}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      readOnly
                      style={{ backgroundColor: "#f5f5f5" }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Thông tin cá nhân</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Giới tính</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      style={{
                        padding: "12px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                      }}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="M">Nam</option>
                      <option value="F">Nữ</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Thông tin liên hệ</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "error" : ""}
                      placeholder="0123456789"
                    />
                    {errors.phone && (
                      <span className="error-text">{errors.phone}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Chức vụ</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="Nhập chức vụ"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-enhanced">
              <div className="info-section">
                <h4>Thông tin cơ bản</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <UserOutlined className="info-icon" />
                    <div>
                      <label>Họ và tên</label>
                      <span>
                        {formData.lastName} {formData.firstName}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <MailOutlined className="info-icon" />
                    <div>
                      <label>Email</label>
                      <span>{formData.email || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <PhoneOutlined className="info-icon" />
                    <div>
                      <label>Số điện thoại</label>
                      <span>{formData.phone || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <UserOutlined className="info-icon" />
                    <div>
                      <label>Tên đăng nhập</label>
                      <span>{formData.username || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <CalendarOutlined className="info-icon" />
                    <div>
                      <label>Ngày sinh</label>
                      <span>
                        {formData.dob
                          ? new Date(formData.dob).toLocaleDateString("vi-VN")
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <UserOutlined className="info-icon" />
                    <div>
                      <label>Giới tính</label>
                      <span>
                        {formData.gender === "M"
                          ? "Nam"
                          : formData.gender === "F"
                          ? "Nữ"
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="info-section">
                <h4>Thông tin công việc</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <SettingOutlined className="info-icon" />
                    <div>
                      <label>Vai trò</label>
                      <span>Quản trị viên</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <BankOutlined className="info-icon" />
                    <div>
                      <label>Chức vụ</label>
                      <span>{formData.jobTitle || "Quản trị viên"}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <CalendarOutlined className="info-icon" />
                    <div>
                      <label>Ngày tạo tài khoản</label>
                      <span>
                        {adminProfile?.createdAt || adminProfile?.lastLogin
                          ? new Date(
                              adminProfile.createdAt || adminProfile.lastLogin
                            ).toLocaleDateString("vi-VN")
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="info-item">
                    <SettingOutlined className="info-icon" />
                    <div>
                      <label>Trạng thái</label>
                      <Tag color="success">Hoạt động</Tag>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="info-section">
                <h4>Thông tin liên hệ</h4>
                <div className="info-grid">
                  <div className="info-item full-width">
                    <HomeOutlined className="info-icon" />
                    <div>
                      <label>Địa chỉ</label>
                      <span>{formData.address || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card
          className="children-card"
          title="Quyền hạn quản trị"
          extra={<SettingOutlined />}
          styles={{ body: { padding: "24px" } }}
        >
          <div className="permissions-list">
            <div className="permission-item">
              <TeamOutlined className="permission-icon" />
              <div>
                <h4>Quản lý người dùng</h4>
                <p>Tạo, chỉnh sửa, xóa tài khoản người dùng trong hệ thống</p>
                <Tag color="green">Có quyền</Tag>
              </div>
            </div>

            <div className="permission-item">
              <SettingOutlined className="permission-icon" />
              <div>
                <h4>Cài đặt hệ thống</h4>
                <p>Thay đổi cấu hình và thiết lập hệ thống</p>
                <Tag color="green">Có quyền</Tag>
              </div>
            </div>

            <div className="permission-item">
              <UserOutlined className="permission-icon" />
              <div>
                <h4>Quản lý hồ sơ</h4>
                <p>Xem và chỉnh sửa hồ sơ của tất cả người dùng</p>
                <Tag color="green">Có quyền</Tag>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={previewVisible}
        title="Xem trước ảnh"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};

// Settings Management Component - moved outside main component
const SettingsManagement = () => {
  const { settings, updateSettings, loading } = useSystemSettings();
  const [formData, setFormData] = useState({
    systemName: "",
    contactEmail: "",
    twoFactorAuth: false,
    activityLogging: false,
  });
  const [saving, setSaving] = useState(false);

  // Initialize form with current settings
  useEffect(() => {
    setFormData({
      systemName: settings.systemName || "",
      contactEmail: settings.contactEmail || "",
      twoFactorAuth: settings.twoFactorAuth || false,
      activityLogging: settings.activityLogging || false,
    });
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const result = await updateSettings(formData);

      if (result.success) {
        message.success("Cài đặt hệ thống đã được cập nhật thành công!");
      } else {
        message.error(
          "Có lỗi xảy ra khi cập nhật cài đặt: " +
            (result.error || "Lỗi không xác định")
        );
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      message.error("Có lỗi xảy ra khi lưu cài đặt");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-management">
      <h2>Cài đặt hệ thống</h2>
      <div className="settings-sections">
        <div className="settings-section">
          <h3>Cài đặt chung</h3>
          <div className="setting-item">
            <label>Tên hệ thống</label>
            <input
              type="text"
              name="systemName"
              value={formData.systemName}
              onChange={handleInputChange}
              disabled={loading || saving}
            />
          </div>
          <div className="setting-item">
            <label>Email liên hệ</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              disabled={loading || saving}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Cài đặt bảo mật</h3>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                name="twoFactorAuth"
                checked={formData.twoFactorAuth}
                onChange={handleInputChange}
                disabled={loading || saving}
              />
              Yêu cầu xác thực 2 bước
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                name="activityLogging"
                checked={formData.activityLogging}
                onChange={handleInputChange}
                disabled={loading || saving}
              />
              Ghi log hoạt động
            </label>
          </div>
        </div>
      </div>
      <button
        className="btn-primary"
        onClick={handleSaveSettings}
        disabled={loading || saving}
      >
        {saving ? "Đang lưu..." : "Lưu cài đặt"}
      </button>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("users");
  const [userInfo, setUserInfo] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Antd v5 notification context
  const [api, contextHolder] = notification.useNotification();

  // Configure notification placement and style
  useEffect(() => {
    console.log("Configuring notification...");
    notification.config({
      placement: "topRight",
      duration: 4.5,
      top: 90, // Account for header height
      maxCount: 1, // Only show 1 notification at a time to avoid overlap
      getContainer: () => {
        console.log("Notification getContainer called");
        return document.body;
      },
    });

    // Configure message component for better display
    message.config({
      top: 100, // Position from top
      duration: 3,
      maxCount: 3,
      getContainer: () => {
        console.log("Message getContainer called");
        return document.body;
      },
    });

    console.log("Notification and message configured");

    // Test multiple notification positions
    // No test notifications on component mount
  }, []);

  // Helper function to translate role names to Vietnamese
  const getRoleNameInVietnamese = (role) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "MANAGER":
        return "Quản lý";
      case "SCHOOLNURSE":
        return "Y tá";
      default:
        return role;
    }
  };

  // Missing state variables being added
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState("add"); // "add", "edit", "view"
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalParents: 0,
    totalStudents: 0,
  });

  // Ant Design form instances
  const [userFormInstance] = Form.useForm();

  const { user, isAuthenticated, isStaff } = useAuth();

  // Function to fetch/refresh users data
  const fetchUsers = async () => {
    if (isAuthenticated && isStaff()) {
      try {
        setLoading(true);
        const data = await getAllUsers();

        // Ensure data is an array
        const usersArray = Array.isArray(data) ? data : [];
        setUsers(usersArray);

        // Calculate stats
        const totalUsers = usersArray.length;
        const totalParents = usersArray.filter(
          (u) => u.roleName === "PARENT"
        ).length;
        const totalStudents = usersArray.filter(
          (u) => u.roleName === "STUDENT"
        ).length;

        setStats({
          totalUsers,
          totalParents,
          totalStudents,
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        message.error("Không thể tải danh sách người dùng");
        setLoading(false);
      }
    }
  };

  // Load users from API
  useEffect(() => {
    fetchUsers();
  }, [isAuthenticated, isStaff]);

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isStaff()) {
      message.error("Bạn không có quyền truy cập vào trang này");
      navigate("/");
      return;
    }

    // Set user info from auth context
    setUserInfo(user);
  }, [navigate, isAuthenticated, isStaff, user]);

  // Separate useEffect to handle URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const validTabs = ["users", "profile", "settings"];
      if (validTabs.includes(tabParam)) {
        setActiveSection(tabParam);
      }
    } else {
      // If no tab parameter, default to users
      setActiveSection("users");
    }
  }, [searchParams]);

  const getBreadcrumbItems = () => {
    const currentItem = getMenuItems().find(
      (item) => item.key === activeSection
    );
    return [
      { title: "Dashboard" },
      { title: currentItem?.label || "Quản lý người dùng" },
    ];
  };

  // User Management Functions
  const resetUserForm = () => {
    console.log("Resetting user form...");

    // Wait for next tick to ensure form is properly mounted
    setTimeout(() => {
      // Use resetFields to properly reset the form
      userFormInstance.resetFields();

      // Set initial default values explicitly to ensure proper field registration
      const initialValues = {
        role: "SCHOOLNURSE",
        username: "",
        password: "",
        email: "",
        jobTitle: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        gender: "",
        dob: null,
        status: "ACTIVE",
      };

      // Set each field value explicitly
      userFormInstance.setFieldsValue(initialValues);

      console.log("User form reset with proper initial values");
    }, 0);
  };

  // Handle role change to clear irrelevant fields
  const handleRoleChange = (newRole, form) => {
    console.log("Role changed to:", newRole);

    // Prepare the fields to update based on role
    const fieldsToUpdate = {
      username: "",
      password: "",
      email: "",
      jobTitle: "",
      status: "ACTIVE", // Keep status as ACTIVE
    };

    console.log("Clearing role-specific fields with proper defaults");

    // Set role-specific defaults
    if (newRole === "ADMIN") {
      fieldsToUpdate.username = "";
      fieldsToUpdate.password = "";
      fieldsToUpdate.email = "";
      console.log("Set ADMIN defaults: username='', password='', email=''");
    } else if (newRole === "SCHOOLNURSE") {
      fieldsToUpdate.username = "";
      fieldsToUpdate.password = "";
      fieldsToUpdate.email = "";
      console.log(
        "Set SCHOOLNURSE defaults: username='', password='', email=''"
      );
    } else if (newRole === "MANAGER") {
      fieldsToUpdate.username = "";
      fieldsToUpdate.password = "";
      fieldsToUpdate.email = "";
      console.log("Set MANAGER defaults: username='', password='', email=''");
    }

    console.log("fieldsToUpdate before setFieldsValue:", fieldsToUpdate);

    // Update all fields at once
    form.setFieldsValue(fieldsToUpdate);

    // Debug: Check if fields were set correctly
    setTimeout(() => {
      const currentValues = form.getFieldsValue();
      console.log("After setFieldsValue - all form values:", currentValues);
    }, 100);

    console.log("Role-specific fields initialized for:", newRole);
  };

  // Handle profile update callback
  const handleProfileUpdate = async (updatedProfile) => {
    console.log("Profile updated, refreshing user list...", updatedProfile);

    // Update userInfo state with new profile data
    setUserInfo((prev) => ({
      ...prev,
      ...updatedProfile,
    }));

    // Refresh the user list to show updated admin info
    await fetchUsers();
  };

  const openAddUserModal = () => {
    setModalMode("add");
    setSelectedUser(null);
    setShowUserModal(true);

    // Reset form after modal is shown to ensure form is mounted
    setTimeout(() => {
      resetUserForm();
    }, 100);
  };

  const openViewUserModal = (user) => {
    // Clean and format user data for modal display
    const userForModal = {
      ...user,
      enabled: user.enabled, // Ensure consistent boolean value
      // Keep original values without nullifying them
      firstName: user.firstName?.trim() || user.firstName || "",
      lastName: user.lastName?.trim() || user.lastName || "",
      email: user.email?.trim() || user.email || "",
      phone: user.phone?.trim() || user.phone || "",
      address: user.address?.trim() || user.address || "",
      jobTitle: user.jobTitle?.trim() || user.jobTitle || "",
      // Ensure role display is consistent
      roleName: user.roleName || user.role,
      // Format dates properly
      createdAt: user.createdAt
        ? dayjs(user.createdAt).format("DD/MM/YYYY HH:mm")
        : null,
    };

    setSelectedUser(userForModal);
    setModalMode("view");
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    try {
      const values = await userFormInstance.validateFields();

      // Check if critical fields are missing or undefined
      if (
        values.role === "SCHOOLNURSE" ||
        values.role === "ADMIN" ||
        values.role === "MANAGER"
      ) {
        if (!values.username || values.username.trim() === "") {
          message.error("Tên đăng nhập là bắt buộc cho vai trò " + values.role);
          return;
        }
        if (!values.password || values.password.trim() === "") {
          message.error("Mật khẩu là bắt buộc cho vai trò " + values.role);
          return;
        }
        if (!values.email || values.email.trim() === "") {
          message.error("Email là bắt buộc cho vai trò " + values.role);
          return;
        }
      }

      // Set status to ACTIVE by default for all new users
      values.status = "ACTIVE";

      // Format the data for the backend API
      let userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
        gender: values.gender,
        address: values.address,
        role: values.role,
        phone: values.phone,
      };

      // Add role-specific fields for all roles
      userData.email = values.email;
      userData.username = values.username;
      userData.password = values.password;
      userData.status = values.status;

      if (values.role === "SCHOOLNURSE") {
        userData.jobTitle = "Y tá";
      } else if (values.role === "ADMIN") {
        userData.jobTitle = "Quản trị viên";
      } else if (values.role === "MANAGER") {
        userData.jobTitle = "Quản lý";
      }

      console.log("Final userData to be sent to API:", userData);

      if (modalMode === "add") {
        setLoading(true);
        try {
          console.log("Starting createUser process");
          console.log("Calling createUser API with data:", userData);

          const newUser = await createUser(userData);
          console.log("New user created successfully:", newUser);

          // Format the new user object to match frontend expectations
          const formattedNewUser = {
            id: newUser.userId || newUser.id,
            userId: newUser.userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            username: userData.username,
            phone: userData.phone,
            roleName: userData.role,
            role: userData.role,
            enabled: userData.status === "ACTIVE",
            status: userData.status,
            dob: userData.dob,
            gender: userData.gender,
            address: userData.address,
            jobTitle: userData.jobTitle,
            createdAt: new Date().toISOString(),
            ...newUser, // Keep any additional fields from API response
          };

          console.log("Formatted new user:", formattedNewUser);

          // Update users list with the formatted new user
          setUsers((prev) => {
            const updatedUsers = [...prev, formattedNewUser];
            console.log("Updated users list:", updatedUsers);
            return updatedUsers;
          });

          // Update stats
          setStats((prev) => {
            const newStats = { ...prev, totalUsers: prev.totalUsers + 1 };
            console.log("Updated stats:", newStats);
            return newStats;
          });

          // Clear any existing notifications first to avoid overlapping
          api.destroy();

          // Show simple success notification
          api.success({
            message: `Đã thêm thành công ${userData.lastName} ${userData.firstName}`,
            duration: 5,
            style: {
              fontSize: "14px",
              padding: "8px 16px",
            },
          });

          // Close modal and reset form
          setShowUserModal(false);
          resetUserForm();

          console.log("createUser process completed successfully");
        } catch (error) {
          console.error("Error creating user:", error);

          // Clear any existing notifications first
          api.destroy();

          // Show simple error notification
          api.error({
            message: `Lỗi tạo user: ${error.message}`,
            duration: 5,
            style: {
              fontSize: "14px",
              padding: "8px 16px",
            },
          });
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Form validation error:", error);
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };

  const handleDeleteUser = async (user) => {
    setLoading(true);
    try {
      console.log("Toggling user status for:", user);

      const result = await toggleUserStatus(user.id);
      console.log("Toggle status result:", result);

      // Update the user in the local state with new status
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, enabled: !u.enabled } : u))
      );

      // Show appropriate message based on new status
      const newStatus = !user.enabled;
      if (newStatus) {
        message.success(
          `Đã kích hoạt lại người dùng ${user.firstName} ${user.lastName}`
        );
      } else {
        message.success(
          `Đã vô hiệu hóa người dùng ${user.firstName} ${user.lastName}`
        );
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      message.error("Lỗi khi thay đổi trạng thái người dùng: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state check
  if (!userInfo) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f4f6fb",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // renderContent function to render the appropriate component
  const renderContent = () => {
    const filteredUsers = users.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const matchesSearch =
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.roleName === filterRole;
      return matchesSearch && matchesRole;
    });

    switch (activeSection) {
      case "users":
        return (
          <UserManagement
            filteredUsers={filteredUsers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            users={users}
            openAddUserModal={openAddUserModal}
            openViewUserModal={openViewUserModal}
            handleDeleteUser={handleDeleteUser}
            showUserModal={showUserModal}
            setShowUserModal={setShowUserModal}
            modalMode={modalMode}
            selectedUser={selectedUser}
            handleSaveUser={handleSaveUser}
            userFormInstance={userFormInstance}
            handleRoleChange={handleRoleChange}
            loading={loading}
          />
        );
      case "profile":
        return (
          <AdminProfile
            userInfo={userInfo}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "settings":
        return <SettingsManagement />;
      default:
        return (
          <UserManagement
            filteredUsers={filteredUsers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            users={users}
            openAddUserModal={openAddUserModal}
            openViewUserModal={openViewUserModal}
            handleDeleteUser={handleDeleteUser}
            showUserModal={showUserModal}
            setShowUserModal={setShowUserModal}
            modalMode={modalMode}
            selectedUser={selectedUser}
            handleSaveUser={handleSaveUser}
            userFormInstance={userFormInstance}
            handleRoleChange={handleRoleChange}
            loading={loading}
          />
        );
    }
  };

  const getMenuItems = () => [
    {
      key: "users",
      icon: <TeamOutlined />,
      label: "Quản lý người dùng",
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      key: "toggle-sidebar",
      icon: collapsed ? <RightOutlined /> : <LeftOutlined />,
      label: "Thu gọn",
    },
  ];

  const handleMenuClick = (e) => {
    const tabKey = e.key;

    // Handle sidebar toggle separately
    if (tabKey === "toggle-sidebar") {
      setCollapsed(!collapsed);
      return;
    }

    setActiveSection(tabKey);
    navigate(`/admin/dashboard?tab=${tabKey}`);
  };

  return (
    <>
      {contextHolder}
      <Layout
        style={{
          minHeight: "calc(100vh - 140px)",
          background: "#f4f6fb",
          margin: "90px 20px 30px 20px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
        }}
      >
        <Sider
          width={240}
          collapsed={collapsed}
          theme="light"
          className="admin-sidebar"
          style={{
            borderRight: "1px solid #f0f0f0",
            background: "#fff",
            zIndex: 10,
            paddingTop: 24,
            position: "relative",
          }}
          trigger={null}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 24,
              marginTop: 8,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#fff2e8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #ff6b35",
              }}
            >
              <SettingOutlined style={{ fontSize: 32, color: "#ff6b35" }} />
            </div>
            {!collapsed && (
              <span
                style={{
                  fontWeight: 600,
                  color: "#ff6b35",
                  fontSize: 18,
                  marginTop: 12,
                  borderRadius: 20,
                  padding: "4px 12px",
                  background: "#fff2e8",
                }}
              >
                Quản trị viên
              </span>
            )}
          </div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[activeSection]}
            onClick={handleMenuClick}
            items={getMenuItems()}
            style={{ border: "none", fontWeight: 500, fontSize: 16 }}
          />
        </Sider>
        <Layout style={{ marginLeft: 0 }}>
          <Header
            style={{
              background: "#fff",
              padding: "16px 32px",
              height: "auto",
              lineHeight: "normal",
              minHeight: 80,
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #f0f0f0",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ flex: 1 }}>
              <Breadcrumb
                items={getBreadcrumbItems()}
                style={{ fontSize: 14, marginBottom: 4 }}
              />
              <h1
                style={{
                  color: "#ff6b35",
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                Bảng điều khiển quản trị viên
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#fff2e8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #ff6b35",
                }}
              >
                <UserOutlined style={{ fontSize: 20, color: "#ff6b35" }} />
              </div>
              <span style={{ fontWeight: 500, fontSize: 16 }}>
                {userInfo?.lastName || ""} {userInfo?.firstName || ""}
              </span>
            </div>
          </Header>
          <Content
            style={{
              margin: "16px 24px 24px 24px",
              padding: 0,
              minHeight: "calc(100vh - 260px)",
              background: "transparent",
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default AdminDashboard;
