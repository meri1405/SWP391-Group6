import React from 'react';
import { Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { USER_ROLES, ROLE_LABELS } from '../../constants/userRoles';

const UserSearchAndFilter = ({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  totalUsers,
  filteredCount
}) => {
  return (
    <div className="filters-section">
      <div className="search-bar">
        <div className="search-input-wrapper">
          {/* <SearchOutlined className="search-icon" /> */}
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="btn-search">Tìm kiếm</button>
      </div>

      <div className="filter-bar">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="role-filter"
        >
          <option value="all">Tất cả vai trò</option>
          {Object.values(USER_ROLES).map(role => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>

      <div className="users-stats">
        <span>
          Hiển thị {filteredCount} / {totalUsers} người dùng
        </span>
      </div>
    </div>
  );
};

export default UserSearchAndFilter;

