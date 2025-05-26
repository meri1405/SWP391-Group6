import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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

        <style jsx>{`
          .access-denied-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
            padding: 2rem;
            background-color: #f8f9fa;
          }

          .access-denied-content {
            text-align: center;
            background: white;
            padding: 3rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
          }

          .access-denied-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
          }

          .access-denied-content h2 {
            color: #dc3545;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            font-weight: 600;
          }

          .access-denied-content p {
            color: #495057;
            font-size: 1rem;
            line-height: 1.6;
            margin: 0 0 1rem 0;
          }

          .access-denied-content p:last-of-type {
            margin-bottom: 2rem;
          }

          .access-denied-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .btn-back,
          .btn-login {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s ease;
            min-width: 120px;
          }

          .btn-back {
            background: #6c757d;
            color: white;
          }

          .btn-back:hover {
            background: #5a6268;
          }

          .btn-login {
            background: #1976d2;
            color: white;
          }

          .btn-login:hover {
            background: #1565c0;
          }

          @media (max-width: 480px) {
            .access-denied-actions {
              flex-direction: column;
            }

            .btn-back,
            .btn-login {
              width: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;
