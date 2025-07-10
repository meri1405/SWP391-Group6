import React from 'react';
import { Button, Space, Popconfirm, Tag } from 'antd';
import { EyeOutlined, CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { USER_ROLES, ROLE_LABELS, ROLE_COLORS } from '../../constants/userRoles';

// Helper function to convert LocalDateTime array to Date
const convertLocalDateTimeArray = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
    return null;
  }
  
  try {
    // Array format: [year, month, day, hour, minute, second, nanosecond]
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
    // Note: JavaScript Date month is 0-indexed, but LocalDateTime month is 1-indexed
    return new Date(year, month - 1, day, hour, minute, second);
  } catch (error) {
    console.error('Error converting date array:', error);
    return null;
  }
};

const UserTable = ({
  users,
  onViewUser,
  onToggleUserStatus,
  loading
}) => {
  // Debug logging
  console.log('UserTable received users:', users);
  console.log('Users length:', users?.length);

  const getRoleLabel = (roleName) => {
    return ROLE_LABELS[roleName] || 'Chưa xác định';
  };

  const getRoleColor = (roleName) => {
    return ROLE_COLORS[roleName] || 'default';
  };

  return (
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
          {users.map((user, index) => (
            <tr key={user.id || user.userId || `user-${index}`}>
              <td>{index + 1}</td>
              <td>{user.lastName || ""}</td>
              <td>{user.firstName || ""}</td>
              <td>{user.email || "-"}</td>
              <td>{user.username || "-"}</td>
              <td>{user.phone || "-"}</td>
              <td>
                <Tag color={getRoleColor(user.roleName)}>
                  {getRoleLabel(user.roleName)}
                </Tag>
              </td>
              <td>
                <span className={`status ${user.enabled ? "active" : "inactive"}`}>
                  {user.enabled ? "Hoạt động" : "Không hoạt động"}
                </span>
              </td>
              <td>
                {(() => {
                  const date = convertLocalDateTimeArray(user.createdAt);
                  return date ? date.toLocaleDateString("vi-VN") : "N/A";
                })()}
              </td>
              <td>
                <div className="action-buttons">
                  <Button
                    className="btn-view"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => onViewUser(user)}
                    title="Xem chi tiết"
                  />
                  <Popconfirm
                    title="Xác nhận thay đổi trạng thái"
                    description={`Bạn có muốn ${
                      user.enabled ? "vô hiệu hóa" : "kích hoạt lại"
                    } người dùng ${user.firstName} ${user.lastName}?`}
                    onConfirm={() => onToggleUserStatus(user)}
                    okText={user.enabled ? "Vô hiệu hóa" : "Kích hoạt"}
                    cancelText="Hủy"
                    okType={user.enabled ? "danger" : "primary"}
                  >
                    <Button
                      className={user.enabled ? "btn-delete" : "btn-view"}
                      icon={user.enabled ? <CloseOutlined /> : <SaveOutlined />}
                      size="small"
                      title={user.enabled ? "Vô hiệu hóa" : "Kích hoạt lại"}
                      loading={loading}
                    />
                  </Popconfirm>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="no-data">
          <p>Không tìm thấy người dùng nào phù hợp với tiêu chí tìm kiếm.</p>
        </div>
      )}
    </div>
  );
};

export default UserTable;
