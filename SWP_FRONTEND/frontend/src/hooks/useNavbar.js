import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import webSocketService from "../services/webSocketService";
import notificationService from "../services/notificationService";
import notificationEventService from "../services/notificationEventService";

/**
 * Custom hook for managing navbar state and functionality
 */
export const useNavbar = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [_timeUpdateTrigger, setTimeUpdateTrigger] = useState(0);

  // Auth context
  const { user, logout, isParent, isStaff, isSchoolNurse, isManager, getToken } = useAuth();

  // Refs for click outside detection
  const notificationRef = useRef(null);
  const userDropdownRef = useRef(null);

  /**
   * Load notifications from the server
   */
  const loadNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setLoadingNotifications(true);
      
      const { notifications: loadedNotifications, unreadCount } = 
        await notificationService.loadNotifications(token, isSchoolNurse, isManager, 5);

      setNotifications(loadedNotifications);
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
      setNotificationCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  }, [getToken, isSchoolNurse, isManager]);

  /**
   * Setup WebSocket connection for real-time notifications
   */
  const setupWebSocketConnection = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      // Connect to WebSocket if not already connected
      if (!webSocketService.isConnected()) {
        await webSocketService.connect(token);
      }

      // Add message handler for real-time notifications
      webSocketService.addMessageHandler(
        "navbar-notifications",
        (newNotification) => {
          console.log("Received real-time notification in navbar:", newNotification);

          // Transform the new notification
          const transformedNotification = notificationService.transformRealtimeNotification(newNotification);

          // Add new notification to the beginning of the list (keep max 5)
          setNotifications((prev) => [transformedNotification, ...prev].slice(0, 5));
          setNotificationCount((prev) => prev + 1);
        }
      );
    } catch (error) {
      console.error("Error setting up WebSocket connection in navbar:", error);
    }
  }, [getToken]);

  /**
   * Toggle notifications dropdown and mark as read when opening
   */
  const toggleNotifications = async () => {
    setShowNotifications(!showNotifications);
    
    if (!showNotifications && notifications.length > 0) {
      // Mark unread notifications as read when opening dropdown
      try {
        const unreadNotifications = notifications.filter((n) => !n.read);
        const unreadIds = unreadNotifications.map(n => n.id);
        
        await notificationService.markMultipleNotificationsAsRead(
          unreadIds, 
          getToken(), 
          isSchoolNurse, 
          isManager
        );

        // Update local state
        const updatedNotifications = notifications.map((notification) => ({
          ...notification,
          read: true,
        }));
        setNotifications(updatedNotifications);
        setNotificationCount(0);
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    }
    setShowUserDropdown(false); // Close user dropdown when opening notifications
  };

  /**
   * Handle individual notification click
   */
  const handleNotificationClick = async (id) => {
    try {
      await notificationService.markNotificationAsRead(id, getToken(), isSchoolNurse, isManager);

      // Update local notification state
      const updatedNotifications = notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);

      // Reload unread count from server to ensure accuracy
      const newUnreadCount = await notificationService.getUnreadCount(getToken(), isSchoolNurse, isManager);
      setNotificationCount(newUnreadCount);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  /**
   * Toggle user dropdown
   */
  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
    setShowNotifications(false); // Close notifications when opening user dropdown
  };

  /**
   * Close dropdown when specific action is taken
   */
  const closeDropdowns = () => {
    setShowUserDropdown(false);
    setShowNotifications(false);
  };

  /**
   * Close notifications dropdown with delay
   */
  const closeNotificationsWithDelay = () => {
    setTimeout(() => {
      setShowNotifications(false);
    }, 100);
  };

  // Check if user can see notifications
  const canSeeNotifications = notificationService.canUserSeeNotifications(
    user, 
    isParent, 
    isSchoolNurse, 
    isManager
  );

  // Load notifications for users who can see them
  useEffect(() => {
    if (user && canSeeNotifications) {
      loadNotifications();
      setupWebSocketConnection();
    }

    return () => {
      // Cleanup WebSocket when component unmounts
      if (webSocketService.isConnected()) {
        webSocketService.removeMessageHandler("navbar-notifications");
      }
    };
  }, [isParent, isSchoolNurse, isManager, user, canSeeNotifications, loadNotifications, setupWebSocketConnection]);

  // Listen for global notification refresh events
  useEffect(() => {
    if (user && canSeeNotifications) {
      const cleanup = notificationEventService.addRefreshListener(() => {
        console.log('Navbar: Received notification refresh event');
        loadNotifications();
      });

      return cleanup;
    }
  }, [user, canSeeNotifications, loadNotifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update time display every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUpdateTrigger(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return {
    // State
    searchQuery,
    setSearchQuery,
    showUserDropdown,
    showNotifications,
    notificationCount,
    notifications,
    loadingNotifications,
    canSeeNotifications,
    
    // Refs
    notificationRef,
    userDropdownRef,
    
    // Auth
    user,
    logout,
    isParent,
    isStaff,
    isSchoolNurse,
    isManager,
    
    // Functions
    toggleNotifications,
    toggleUserDropdown,
    handleNotificationClick,
    closeDropdowns,
    closeNotificationsWithDelay,
  };
};
