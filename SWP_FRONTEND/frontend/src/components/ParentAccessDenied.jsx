import React from "react";
import { useNavigate } from "react-router-dom";

const ParentAccessDenied = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="parent-access-denied-container">
      <div className="parent-access-denied-card">
        <div className="access-denied-icon">🚫</div>
        <h1>Yêu cầu bị từ chối</h1>
        <p>
          Tài khoản <strong>PARENT</strong> không được phép đăng nhập bằng
          username/password vào trang quản trị.
        </p>
        <p>
          Vui lòng sử dụng <strong>số điện thoại</strong> để đăng nhập.
        </p>
        <p>
          Chỉ có tài khoản với quyền <strong>ADMIN</strong> mới có thể truy cập
          trang quản trị bằng username/password.
        </p>
        <button className="back-to-login-btn" onClick={handleBackToLogin}>
          Quay lại trang đăng nhập
        </button>
      </div>

      <style jsx>{`
        .parent-access-denied-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          padding: 2rem;
        }

        .parent-access-denied-card {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9),
            rgba(255, 255, 255, 0.7)
          );
          backdrop-filter: blur(20px);
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          max-width: 600px;
          width: 100%;
        }

        .access-denied-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .parent-access-denied-card h1 {
          color: #dc3545;
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 1.5rem 0;
        }

        .parent-access-denied-card p {
          color: #495057;
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 1rem 0;
        }

        .parent-access-denied-card p:last-of-type {
          margin-bottom: 2rem;
        }

        .back-to-login-btn {
          background: linear-gradient(45deg, #6c757d, #495057);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
        }

        .back-to-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
        }

        @media (max-width: 768px) {
          .parent-access-denied-container {
            padding: 1rem;
          }

          .parent-access-denied-card {
            padding: 2rem;
          }

          .parent-access-denied-card h1 {
            font-size: 1.5rem;
          }

          .parent-access-denied-card p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ParentAccessDenied;
