import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Initial notification count
  const navigate = useNavigate();
  const { user, logout, isParent, isStaff } = useAuth();
  const location = useLocation();

  // Refs for click outside detection
  const notificationRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Mock notifications data - in a real app, this would come from an API
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Lịch khám định kỳ",
      text: "Có lịch khám sức khỏe định kỳ cho con bạn vào ngày 28/05/2025",
      time: "2 giờ trước",
      icon: "user-md",
      read: false,
    },
    {
      id: 2,
      title: "Tiêm chủng",
      text: "Nhắc nhở tiêm vaccine DPT lần 2 cho con bạn",
      time: "1 ngày trước",
      icon: "syringe",
      read: false,
    },
    {
      id: 3,
      title: "Đơn thuốc",
      text: "Đơn thuốc của con bạn đã được duyệt",
      time: "3 ngày trước",
      icon: "pills",
      read: true,
    },
  ]);

  // Calculate unread notifications count
  useEffect(() => {
    const unreadCount = notifications.filter(
      (notification) => !notification.read
    ).length;
    setNotificationCount(unreadCount);
  }, [notifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLoginClick = () => {
    window.scrollTo(0, 0); // Scroll to top immediately
    navigate("/login");
  };

  const handleDashboardClick = () => {
    if (isParent()) {
      navigate("/parent-dashboard");
    } else if (isStaff()) {
      // Navigate to appropriate staff dashboard based on role
      switch (user.roleName) {
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        case "MANAGER":
          navigate("/manager-dashboard");
          break;
        case "SCHOOLNURSE":
          navigate("/nurse-dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate("/");
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
    setShowNotifications(false); // Close notifications when opening user dropdown
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all notifications as read when opening
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        read: true,
      }));
      setNotifications(updatedNotifications);
    }
    setShowUserDropdown(false); // Close user dropdown when opening notifications
  };

  const handleNotificationClick = (id) => {
    // Mark the specific notification as read
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    // Không đóng dropdown tại đây nữa vì đã xử lý trong onClick của Link
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link
          to="/"
          className={`navbar-logo${location.pathname === "/" ? " active" : ""}`}
        >
          <img src="/medical-logo.svg" alt="Logo" className="logo-img" />
          <span>Y Tế Học Đường</span>
        </Link>

        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
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

        <div className="nav-links">
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
          </Link>          {user ? (
            <>
              {/* Show management button for all authenticated users */}
              <button
                onClick={handleDashboardClick}
                className={`nav-link management-btn${
                  location.pathname.includes("dashboard") ? " active" : ""
                }`}
              >
                Quản lý
              </button>

              {/* Only show notification bell for parent users who logged in via phone */}
              {isParent() && user.loginMethod !== "username" && (
                <div className="nav-notifications" ref={notificationRef}>
                  <button
                    className="notification-btn"
                    onClick={toggleNotifications}
                  >
                    <i className="fas fa-bell"></i>
                    {notificationCount > 0 && (
                      <span className="notification-badge">
                        {notificationCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="notifications-dropdown">
                      <div className="notifications-header">
                        <h4>Thông báo</h4>
                        <span className="notifications-count">
                          {notificationCount > 0
                            ? `${notificationCount} mới`
                            : "Không có thông báo mới"}
                        </span>
                      </div>
                      <div className="notifications-list">
                        {notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            to="/parent-dashboard?tab=notifications"
                            className={`notification-item ${
                              !notification.read ? "unread" : ""
                            }`}
                            onClick={() => {
                              // Đánh dấu thông báo đã đọc
                              handleNotificationClick(notification.id);
                              // Đảm bảo đóng dropdown sau khi chuyển hướng
                              setTimeout(() => {
                                setShowNotifications(false);
                              }, 100);
                            }}
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
                        ))}
                      </div>
                      <div className="notifications-footer">
                        <Link
                          to="/parent-dashboard?tab=notifications"
                          className="view-all-link"
                          onClick={() => {
                            // Đảm bảo đóng dropdown sau khi chuyển hướng
                            setTimeout(() => {
                              setShowNotifications(false);
                            }, 100);
                          }}
                        >
                          Xem tất cả thông báo
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="user-dropdown" ref={userDropdownRef}>
                <button onClick={toggleUserDropdown} className="user-btn">
                  <div className="user-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  {/* Only show greeting for non-PARENT users or PARENT who logged in via phone */}
                  {(!isParent() || user.loginMethod !== "username") && (
                    <span className="greeting">Xin chào, {user.firstName}</span>
                  )}
                  <i
                    className={`fas fa-chevron-${
                      showUserDropdown ? "up" : "down"
                    }`}
                  ></i>
                </button>

                {showUserDropdown && (
                  <div className="dropdown-menu">
                    <div className="user-info">
                      <div className="user-name">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="user-email">{user.email}</div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link
                      to="/parent-dashboard?tab=profile"
                      className="dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <i className="fas fa-user-circle"></i>
                      Hồ sơ cá nhân
                    </Link>
                    <button
                      onClick={() => {
                        handleDashboardClick();
                        setShowUserDropdown(false);
                      }}
                      className="dropdown-item"
                    >
                      <i className="fas fa-cog"></i>
                      Quản lý
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout-item"
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button onClick={handleLoginClick} className="nav-link login-link">
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
