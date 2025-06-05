import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import axios from "axios";

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

  const logout = useCallback(() => {
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
  }, []);

  // Khởi tạo session timeout timer
  const startLogoutTimer = useCallback(() => {
    // Clear any existing timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    // Set new timer for 30 minutes
    logoutTimerRef.current = setTimeout(() => {
      console.log("Session timeout (30 minutes) - logging out");
      logout();
    }, SESSION_TIMEOUT);
  }, [logout]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        const loginTimestamp = localStorage.getItem("loginTimestamp");

        console.log("Initializing auth state...");
        console.log("Token exists:", !!token);
        console.log("User data exists:", !!userData);
        console.log("Login timestamp:", loginTimestamp);

        if (token && userData) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            console.log(
              "Token is expired during initialization - clearing storage"
            );
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("loginTimestamp");
            setLoading(false);
            return;
          }

          // Parse user data
          const parsedUser = JSON.parse(userData);
          console.log("Restoring user session:", parsedUser);

          // Restore user session
          setUser(parsedUser);

          // Update timestamp to refresh session
          localStorage.setItem("loginTimestamp", Date.now().toString());
          startLogoutTimer();

          console.log("Auth state restored successfully");
        } else {
          console.log("No valid session found");
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
        // Clear potentially corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("loginTimestamp");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup timer on unmount
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [startLogoutTimer]);

  const login = (authResponse) => {
    console.log("Login called with:", authResponse);
    const { token, ...userInfo } = authResponse;

    // Validate required fields
    if (!token) {
      console.error("No token provided in login response");
      throw new Error("Invalid login response - missing token");
    }

    // Check if token is valid
    if (isTokenExpired(token)) {
      console.error("Received expired token");
      throw new Error("Received expired authentication token");
    }

    // Save authentication data to localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userInfo));
    localStorage.setItem("loginTimestamp", Date.now().toString());

    // Update state
    setUser(userInfo);
    console.log("User set to:", userInfo);

    // Start the logout timer (30 minutes)
    startLogoutTimer();

    console.log("Login completed successfully");
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

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error parsing token:", error);
      return true;
    }
  };

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (token && !isTokenExpired(token)) {
      return token;
    }
    return null;
  }; // Function to refresh the session timer
  const refreshSession = useCallback(() => {
    try {
      const token = localStorage.getItem("token");

      // If no token exists, return false immediately
      if (!token) {
        console.log("No token found during refresh - logging out");
        logout();
        return false;
      }

      // Check if token is valid and not expired
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;

        // If token is expired, logout and return false
        if (payload.exp < currentTime) {
          console.log("Token expired during refresh - logging out");
          logout();
          return false;
        }
      } catch (tokenError) {
        console.error("Error parsing token:", tokenError);
        logout();
        return false;
      }

      // Token is valid, refresh the session timestamp
      console.log("Refreshing session timer");
      localStorage.setItem("loginTimestamp", Date.now().toString());
      startLogoutTimer();
      return true;
    } catch (error) {
      console.error("Error in refreshSession:", error);
      logout();
      return false;
    }
  }, [startLogoutTimer, logout]);
  // Set up axios interceptors for authentication
  useEffect(() => {
    console.log("Setting up axios interceptors");

    // Request interceptor - Add token to all requests
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          // Add token to request headers
          config.headers.Authorization = `Bearer ${token}`;

          // Always refresh session when making API calls
          refreshSession();
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle 401 errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.log("Received 401 Unauthorized error - Token may be invalid");
          // Log out the user if they get a 401 error
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptors when component unmounts
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshSession, logout]);

  // Effect to set up activity monitoring
  useEffect(() => {
    if (!user) return;

    // List of events to monitor for user activity
    const activityEvents = [
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
      "mousemove",
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
    activityEvents.forEach((event) => {
      window.addEventListener(event, activityHandler, { passive: true });
    });

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, activityHandler);
      });
    };
  }, [user, refreshSession]);
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
    startLogoutTimer,
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
