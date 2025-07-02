import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/AdminProtectedRoute.css";

const AdminProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Specifically block PARENT from accessing admin routes
  if (user && user.roleName === "PARENT") {
    return (
      <div className="access-denied-container">
        <div className="access-denied-content">
          <div className="access-denied-icon">🚫</div>
          <h2>Yêu cầu bị từ chối</h2>
          <p>
            Tài khoản <strong>PARENT</strong> không được phép đăng nhập bằng
            username/password vào trang quản trị.
          </p>
          <p>
            Chỉ có tài khoản với quyền <strong>ADMIN</strong> mới có thể truy
            cập.
          </p>
          <div className="access-denied-actions">
            <button className="btn-login" onClick={() => navigate("/login")}>
              Quay lại trang đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user exists and has ADMIN role (must be uppercase)
  if (!user || user.roleName !== "ADMIN") {
    return (
      <div className="access-denied-container">
        <div className="access-denied-content">
          <h2>Yêu cầu của bạn bị từ chối</h2>
          <div className="access-denied-actions">
            <button className="btn-back" onClick={() => navigate(-1)}>
              Quay lại
            </button>
            <button className="btn-login" onClick={() => navigate("/login")}>
              Trở về trang Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;
