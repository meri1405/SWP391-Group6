import React from "react";
import { Link } from "react-router-dom";

/**
 * Navigation links component
 */
export const NavLinks = ({ location }) => (
  <>
    <Link
      to="/"
      className={`nav-link${location.pathname === "/" ? " active" : ""}`}
    >
      Trang chủ
    </Link>
    <Link
      to="/documents"
      className={`nav-link${
        location.pathname.startsWith("/documents") ? " active" : ""
      }`}
    >
      Tài liệu
    </Link>
    <Link
      to="/blog"
      className={`nav-link${
        location.pathname.startsWith("/blog") ? " active" : ""
      }`}
    >
      Blog
    </Link>
    <Link
      to="/about"
      className={`nav-link${
        location.pathname === "/about" ? " active" : ""
      }`}
    >
      Giới thiệu
    </Link>
  </>
);

/**
 * Search form component
 */
export const SearchForm = ({ searchQuery, setSearchQuery, onSubmit }) => (
  <div className="search-container">
    <form onSubmit={onSubmit} className="search-form">
      <input
        type="text"
        placeholder="Tìm kiếm thông tin y tế, tin tức..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-button">
        <i className="fas fa-search"></i>
      </button>
    </form>
  </div>
);

/**
 * Notifications dropdown component
 */
export const NotificationsDropdown = ({
  showNotifications,
  notificationCount,
  notifications,
  loadingNotifications,
  isSchoolNurse,
  isManager,
  onNotificationClick,
  onViewAllClick,
}) => {
  if (!showNotifications) return null;

  return (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <h4>Thông báo</h4>
        <span className="notifications-count">
          {notificationCount > 0
            ? `${notificationCount} mới`
            : notifications.length > 0
            ? "Xem thông báo gần đây"
            : "Không có thông báo"}
        </span>
      </div>
      <div className="notifications-list">
        {loadingNotifications ? (
          <div className="notification-item">
            <div className="notification-content">
              <p>Đang tải thông báo...</p>
            </div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <Link
              key={notification.id}
              to={
                isSchoolNurse() 
                  ? "/nurse-dashboard?tab=notifications" 
                  : isManager()
                  ? "/manager-dashboard?tab=notifications"
                  : "/parent-dashboard?tab=notifications"
              }
              className={`notification-item ${
                !notification.read ? "unread" : ""
              }`}
              onClick={() => onNotificationClick(notification.id)}
            >
              <div className="notification-icon">
                <i className={`fas fa-${notification.icon}`}></i>
              </div>
              <div className="notification-content">
                <p className="notification-title">
                  {notification.title}
                </p>
                <p className="notification-text">
                  {notification.text}
                </p>
                <span className="notification-time">
                  {notification.time}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="notification-item">
            <div className="notification-content">
              <p>Không có thông báo nào</p>
            </div>
          </div>
        )}
      </div>
      <div className="notifications-footer">
        <Link
          to={isSchoolNurse() 
              ? "/nurse-dashboard?tab=notifications" 
              : "/parent-dashboard?tab=notifications"}
          className="view-all-link"
          onClick={onViewAllClick}
        >
          Xem tất cả thông báo
        </Link>
      </div>
    </div>
  );
};

/**
 * User dropdown menu component
 */
export const UserDropdown = ({
  showUserDropdown,
  user,
  isParent,
  onProfileClick,
  onDashboardClick,
  onLogoutClick,
}) => {
  if (!showUserDropdown) return null;

  return (
    <div className="dropdown-menu">
      <div className="user-info">
        <div className="user-name">
          {user.lastName} {user.firstName}
        </div>
        <div className="user-email">{user.email}</div>
      </div>
      <div className="dropdown-divider"></div>
      <Link
        to={
          isParent()
            ? "/parent-dashboard?tab=profile"
            : user?.roleName === "MANAGER"
            ? "/manager-dashboard?tab=profile"
            : user?.roleName === "SCHOOLNURSE"
            ? "/nurse-dashboard?tab=profile"
            : "/admin/dashboard?tab=profile"
        }
        className="dropdown-item"
        onClick={onProfileClick}
      >
        <i className="fas fa-user-circle"></i>
        Hồ sơ cá nhân
      </Link>
      <button
        onClick={onDashboardClick}
        className="dropdown-item"
      >
        <i className="fas fa-cog"></i>
        Quản lý
      </button>
      <div className="dropdown-divider"></div>
      <button
        onClick={onLogoutClick}
        className="dropdown-item logout-item"
      >
        <i className="fas fa-sign-out-alt"></i>
        Đăng xuất
      </button>
    </div>
  );
};
