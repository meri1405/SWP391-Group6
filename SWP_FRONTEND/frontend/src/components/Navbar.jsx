import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { parentApi } from "../api/parentApi";
import webSocketService from "../services/webSocketService";
import "../styles/Navbar.css";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isParent, isStaff, getToken } = useAuth();const location = useLocation();
  // Refs for click outside detection
  const notificationRef = useRef(null);
  const userDropdownRef = useRef(null);  const loadNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      setLoadingNotifications(true);
      // Load only 5 most recent notifications to show in dropdown
      const allData = await parentApi.getAllNotifications(token, 5);
      // Load unread notifications to get count
      const unreadData = await parentApi.getUnreadNotifications(token);
      
      // Transform backend notifications to frontend format
      const transformedNotifications = allData.map(notification => ({
        id: notification.id,
        title: notification.title,
        text: notification.message,
        time: formatTimeAgo(notification.createdAt),
        icon: getNotificationIcon(notification),
        read: notification.read
      }));
      
      setNotifications(transformedNotifications);
      setNotificationCount(unreadData.length); // Only count unread notifications for badge
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Keep empty state if error
      setNotifications([]);
      setNotificationCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  }, [getToken]);

  const setupWebSocketConnection = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      // Connect to WebSocket if not already connected
      if (!webSocketService.isConnected()) {
        await webSocketService.connect(token);
      }
      
      // Add message handler for real-time notifications
      webSocketService.addMessageHandler('navbar-notifications', (newNotification) => {
        console.log('Received real-time notification in navbar:', newNotification);
        
        // Transform the new notification
        const transformedNotification = {
          id: newNotification.id,
          title: newNotification.title,
          text: newNotification.message,
          time: 'Vừa xong',
          icon: getNotificationIcon(newNotification),
          read: false
        };
        
        // Add new notification to the beginning of the list (keep max 5)
        setNotifications(prev => [transformedNotification, ...prev].slice(0, 5));
        setNotificationCount(prev => prev + 1);
      });
      
    } catch (error) {
      console.error('Error setting up WebSocket connection in navbar:', error);
    }
  }, [getToken]);

  const getNotificationIcon = (notification) => {
    if (notification.medicationRequest || notification.medicationSchedule) {
      return 'pills';
    }
    return 'info-circle';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Không xác định';
    
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMs = now - notificationDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Vừa xong';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return `${diffInDays} ngày trước`;
    }  };
  // Remove the old useEffect that calculated unread count
  // This is now handled by the notification loading

  // Load notifications for parent users
  useEffect(() => {
    if (isParent() && user.loginMethod !== "username") {
      loadNotifications();
      setupWebSocketConnection();
    }
    
    return () => {
      // Cleanup WebSocket when component unmounts
      if (webSocketService.isConnected()) {
        webSocketService.removeMessageHandler('navbar-notifications');
      }
    };
  }, [isParent, user, loadNotifications, setupWebSocketConnection]);

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
  const toggleNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && notifications.length > 0) {
      // Mark unread notifications as read when opening dropdown
      try {
        const unreadNotifications = notifications.filter(n => !n.read);        for (const notification of unreadNotifications) {
          await parentApi.markNotificationAsRead(notification.id, getToken());
        }
        
        // Update local state
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          read: true,
        }));
        setNotifications(updatedNotifications);
        setNotificationCount(0);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
    setShowUserDropdown(false); // Close user dropdown when opening notifications
  };  const handleNotificationClick = async (id) => {
    try {
      // Mark the specific notification as read
      await parentApi.markNotificationAsRead(id, getToken());
      
      // Update local notification state
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
      
      // Reload unread count from server to ensure accuracy
      const unreadData = await parentApi.getUnreadNotifications(getToken());
      setNotificationCount(unreadData.length);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
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
                  </button>                  {showNotifications && (
                    <div className="notifications-dropdown">                      <div className="notifications-header">
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
                                </p>                                <p className="notification-text">
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
                        {user.lastName} {user.firstName}
                      </div>
                      <div className="user-email">{user.email}</div>
                    </div>
                    <div className="dropdown-divider"></div>                    <Link
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
