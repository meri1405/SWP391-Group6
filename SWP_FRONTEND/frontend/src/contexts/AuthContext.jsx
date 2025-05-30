import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const AuthContext = createContext();

// Thời gian session (30 phút = 30 * 60 * 1000 milliseconds)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef(null);

  // Khởi tạo session timeout timer
  const startLogoutTimer = () => {
    // Clear any existing timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    
    // Set new timer for 30 minutes
    logoutTimerRef.current = setTimeout(() => {
      console.log("Session timeout (30 minutes) - logging out");
      logout();
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    // Check for stored authentication data on app start
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const loginTimestamp = localStorage.getItem("loginTimestamp");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        // Check if the session has already expired
        if (loginTimestamp) {
          const elapsed = Date.now() - parseInt(loginTimestamp, 10);
          if (elapsed >= SESSION_TIMEOUT) {
            // Session expired, clear data
            console.log("Session expired on reload");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("loginTimestamp");
          } else {
            // Session still valid, restore user and start timer
            setUser(parsedUser);
            // Start timer with remaining time
            const remainingTime = SESSION_TIMEOUT - elapsed;
            logoutTimerRef.current = setTimeout(() => {
              console.log("Session timeout (remaining time) - logging out");
              logout();
            }, remainingTime);
          }
        } else {
          // No timestamp, treat as new login
          setUser(parsedUser);
          localStorage.setItem("loginTimestamp", Date.now().toString());
          startLogoutTimer();
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("loginTimestamp");
      }
    }
    setLoading(false);
    
    // Cleanup timer on unmount
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);  const login = (authResponse) => {
    console.log("Login called with:", authResponse);
    const { token, ...userInfo } = authResponse;
    
    // Lưu thông tin đăng nhập vào localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userInfo));
    
    // Lưu thời điểm đăng nhập
    localStorage.setItem("loginTimestamp", Date.now().toString());
    
    // Update state
    setUser(userInfo);
    console.log("User set to:", userInfo);
    
    // Start the logout timer (30 minutes)
    startLogoutTimer();
  };

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTimestamp");
    
    // Clear timeout if it exists
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    
    // Update state
    setUser(null);
  };
  const isParent = () => {
    return user?.roleName === "PARENT";
  };

  const isSchoolNurse = () => {
    return user?.roleName === "SCHOOLNURSE";
  };

  const isStaff = () => {
    const staffRoles = ["ADMIN", "MANAGER", "SCHOOLNURSE"];
    return user && staffRoles.includes(user.roleName);
  };
  const getToken = () => {
    return localStorage.getItem("token");
  };  // Function to refresh the session timer
  const refreshSession = () => {
    if (user) {
      console.log("Refreshing session timer");
      localStorage.setItem("loginTimestamp", Date.now().toString());
      startLogoutTimer();
    }
  };
  
  // Effect to set up activity monitoring
  useEffect(() => {
    if (!user) return;

    // List of events to monitor for user activity
    const activityEvents = [
      'mousedown', 'keydown', 'touchstart', 
      'scroll', 'click', 'mousemove'
    ];
    
    // Throttle function to avoid refreshing too frequently
    let lastRefresh = Date.now();
    const THROTTLE_DELAY = 5 * 60 * 1000; // 5 minutes
    
    const activityHandler = () => {
      const now = Date.now();
      if (now - lastRefresh > THROTTLE_DELAY) {
        refreshSession();
        lastRefresh = now;
      }
    };
    
    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, activityHandler, { passive: true });
    });
    
    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
    };
  }, [user]);
  const value = {
    user,
    login,
    logout,
    refreshSession,
    isParent,
    isSchoolNurse,
    isStaff,
    getToken,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
