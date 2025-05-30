import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const isProcessingRef = useRef(false);
  
  useEffect(() => {
    // Execute only once
    if (isProcessingRef.current) {
      return;
    }
    isProcessingRef.current = true;
    
    // Process OAuth2 callback
    console.log("OAuth2 callback processing starting");
    
    const token = searchParams.get("token");
    const username = searchParams.get("username");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const error = searchParams.get("error");
    const errorMessage = searchParams.get("message");
    
    console.log("OAuth2 params:", {
      hasToken: !!token,
      username,
      role,
      status,
      hasError: !!error
    });
    
    // Handle errors
    if (error) {
      console.error("OAuth2 error:", error);
      navigate("/login?error=" + encodeURIComponent(errorMessage || "Authentication failed"));
      return;
    }
    
    // Validate response
    if (!status || !token || !role) {
      console.error("Invalid OAuth2 response - missing data");
      navigate("/login?error=" + encodeURIComponent("Invalid authentication response"));
      return;
    }
    
    // Validate allowed roles
    const allowedRoles = ["ADMIN", "MANAGER", "SCHOOLNURSE"];
    if (!allowedRoles.includes(role)) {
      console.error("Unauthorized role:", role);
      navigate("/login?error=" + encodeURIComponent("This account doesn't have permission to use Google login"));
      return;
    }
    
    // Process successful login
    try {
      // Create user object
      const userData = {
        token,
        username: username || "User",
        firstName: username || "User",
        lastName: "",
        email: "",
        roleName: role,
        loginMethod: "oauth2"
      };
      
      // Login user
      login(userData);
      
      // Determine dashboard route
      const dashboardRoutes = {
        "ADMIN": "/admin/dashboard",
        "MANAGER": "/manager-dashboard",
        "SCHOOLNURSE": "/nurse-dashboard"
      };
      
      const route = dashboardRoutes[role] || "/";
      
      // Navigate to dashboard
      navigate(route, { replace: true });
      
    } catch (error) {
      console.error("Login error:", error);
      navigate("/login?error=" + encodeURIComponent("Failed to process login"));
    }
    
  }, [searchParams, navigate, login]);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5"
    }}>
      <div style={{
        textAlign: "center",
        padding: "2rem",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #1976d2",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 1rem"
        }}></div>
        <h3 style={{ color: "#333", marginBottom: "0.5rem" }}>Đăng nhập thành công!</h3>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>Đang chuyển đến trang quản lý...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;