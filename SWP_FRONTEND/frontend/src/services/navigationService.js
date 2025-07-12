/**
 * Navigation utility service for handling different user role navigation
 */
class NavigationService {
  /**
   * Get dashboard route based on user role
   * @param {Object} user - User object
   * @param {Function} isParent - Function to check if user is parent
   * @param {Function} isStaff - Function to check if user is staff
   * @returns {string} - Dashboard route
   */
  getDashboardRoute(user, isParent, isStaff) {
    if (isParent()) {
      return "/parent-dashboard";
    } else if (isStaff()) {
      switch (user.roleName) {
        case "ADMIN":
          return "/admin/dashboard";
        case "MANAGER":
          return "/manager-dashboard";
        case "SCHOOLNURSE":
          return "/nurse-dashboard";
        default:
          return "/dashboard";
      }
    }
    return "/dashboard";
  }

  /**
   * Get profile route based on user role
   * @param {Object} user - User object
   * @param {Function} isParent - Function to check if user is parent
   * @returns {string} - Profile route
   */
  getProfileRoute(user, isParent) {
    if (isParent()) {
      return "/parent-dashboard?tab=profile";
    }

    switch (user?.roleName) {
      case "MANAGER":
        return "/manager-dashboard?tab=profile";
      case "SCHOOLNURSE":
        return "/nurse-dashboard?tab=profile";
      default:
        return "/admin/dashboard?tab=profile";
    }
  }

  /**
   * Get notifications route based on user role
   * @param {Function} isSchoolNurse - Function to check if user is school nurse
   * @param {Function} isManager - Function to check if user is manager
   * @returns {string} - Notifications route
   */
  getNotificationsRoute(isSchoolNurse, isManager) {
    if (isSchoolNurse()) {
      return "/nurse-dashboard?tab=notifications";
    } else if (isManager()) {
      return "/manager-dashboard?tab=notifications";
    } else {
      return "/parent-dashboard?tab=notifications";
    }
  }

  /**
   * Check if current path is active
   * @param {string} currentPath - Current pathname
   * @param {string} targetPath - Target path to check
   * @param {boolean} exact - Whether to do exact match
   * @returns {boolean} - Whether path is active
   */
  isPathActive(currentPath, targetPath, exact = false) {
    if (exact) {
      return currentPath === targetPath;
    }
    return currentPath.startsWith(targetPath);
  }

  /**
   * Handle search navigation
   * @param {string} query - Search query
   * @param {Function} navigate - Navigation function
   */
  handleSearch(query, navigate) {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  /**
   * Handle login navigation with scroll to top
   * @param {Function} navigate - Navigation function
   */
  handleLogin(navigate) {
    window.scrollTo(0, 0);
    navigate("/login");
  }

  /**
   * Handle logout navigation
   * @param {Function} logout - Logout function
   * @param {Function} navigate - Navigation function
   */
  handleLogout(logout, navigate) {
    logout();
    navigate("/");
  }
}

// Export singleton instance
export default new NavigationService();
