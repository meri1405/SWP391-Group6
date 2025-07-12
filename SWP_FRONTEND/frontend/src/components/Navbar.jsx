import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSystemSettings } from "../contexts/SystemSettingsContext";
import { useNavbar } from "../hooks/useNavbar";
import navigationService from "../services/navigationService";
import { NavLinks, SearchForm, NotificationsDropdown, UserDropdown } from "./navbar/NavbarComponents";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSystemSettings();
  
  // Use the custom hook for navbar logic
  const {
    searchQuery,
    setSearchQuery,
    showUserDropdown,
    showNotifications,
    notificationCount,
    notifications,
    loadingNotifications,
    canSeeNotifications,
    notificationRef,
    userDropdownRef,
    user,
    logout,
    isParent,
    isStaff,
    isSchoolNurse,
    isManager,
    toggleNotifications,
    toggleUserDropdown,
    handleNotificationClick,
    closeDropdowns,
    closeNotificationsWithDelay,
  } = useNavbar();

  // Event handlers using navigation service
  const handleSearch = (e) => {
    e.preventDefault();
    navigationService.handleSearch(searchQuery, navigate);
  };

  const handleLoginClick = () => {
    navigationService.handleLogin(navigate);
  };

  const handleDashboardClick = () => {
    const route = navigationService.getDashboardRoute(user, isParent, isStaff);
    navigate(route);
  };

  const handleLogout = () => {
    navigationService.handleLogout(logout, navigate);
    closeDropdowns();
  };

  const handleNotificationClickWithNav = (id) => {
    handleNotificationClick(id);
    closeNotificationsWithDelay();
  };

  const handleDashboardClickWithClose = () => {
    handleDashboardClick();
    closeDropdowns();
  };

  const handleProfileClick = () => {
    closeDropdowns();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link
          to="/"
          className={`navbar-logo${location.pathname === "/" ? " active" : ""}`}
        >
          <img src="/medical-logo.svg" alt="Logo" className="logo-img" />
          <span>{settings.systemName}</span>
        </Link>

        <SearchForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSubmit={handleSearch}
        />

        <div className="nav-links">
          <NavLinks location={location} />
          
          {user ? (
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

              {/* Show notification bell for appropriate users */}
              {canSeeNotifications && (
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
                  
                  <NotificationsDropdown
                    showNotifications={showNotifications}
                    notificationCount={notificationCount}
                    notifications={notifications}
                    loadingNotifications={loadingNotifications}
                    isSchoolNurse={isSchoolNurse}
                    isManager={isManager}
                    onNotificationClick={handleNotificationClickWithNav}
                    onViewAllClick={closeNotificationsWithDelay}
                  />
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

                <UserDropdown
                  showUserDropdown={showUserDropdown}
                  user={user}
                  isParent={isParent}
                  onProfileClick={handleProfileClick}
                  onDashboardClick={handleDashboardClickWithClose}
                  onLogoutClick={handleLogout}
                />
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
