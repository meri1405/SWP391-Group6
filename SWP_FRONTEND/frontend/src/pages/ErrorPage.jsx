import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, Typography, Space, Alert } from "antd";
import { 
  ExclamationCircleOutlined, 
  HomeOutlined, 
  LoginOutlined,
  ReloadOutlined 
} from "@ant-design/icons";
import "../styles/ErrorPage.css";

const { Title, Text, Paragraph } = Typography;

const ErrorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorInfo, setErrorInfo] = useState({
    type: "unknown",
    message: "Đã xảy ra lỗi không xác định",
    description: "Vui lòng thử lại sau.",
    canRetry: true
  });

  useEffect(() => {
    const errorType = searchParams.get("type") || "unknown";
    const errorMessage = searchParams.get("message") || "";
    const errorDescription = searchParams.get("description") || "";
    
    // Decode URL encoded messages
    const decodedMessage = errorMessage ? decodeURIComponent(errorMessage) : "";
    const decodedDescription = errorDescription ? decodeURIComponent(errorDescription) : "";
    
    let errorConfig = {
      type: errorType,
      message: decodedMessage || "Đã xảy ra lỗi không xác định",
      description: decodedDescription,
      canRetry: true
    };

    // Configure specific error types
    switch (errorType) {
      case "oauth_login_failed":
        errorConfig = {
          type: "oauth_login_failed",
          message: decodedMessage || "Đăng nhập Google thất bại",
          description: decodedDescription || "Không thể xác thực tài khoản Google của bạn. Vui lòng kiểm tra lại tài khoản và thử lại.",
          canRetry: true
        };
        break;
        
      case "user_not_found":
        errorConfig = {
          type: "user_not_found",
          message: decodedMessage || "Tài khoản không tồn tại",
          description: decodedDescription || "Tài khoản email này chưa được đăng ký trong hệ thống. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
          canRetry: false
        };
        break;
        
      case "unauthorized_role":
        errorConfig = {
          type: "unauthorized_role",
          message: decodedMessage || "Không có quyền truy cập",
          description: decodedDescription || "Tài khoản của bạn không được phép sử dụng tính năng đăng nhập Google. Vui lòng sử dụng tên đăng nhập và mật khẩu.",
          canRetry: false
        };
        break;
        
      case "system_error":
        errorConfig = {
          type: "system_error",
          message: decodedMessage || "Lỗi hệ thống",
          description: decodedDescription || "Đã xảy ra lỗi trong hệ thống. Vui lòng thử lại sau hoặc liên hệ quản trị viên nếu lỗi tiếp tục xảy ra.",
          canRetry: true
        };
        break;
        
      case "first_time_login":
        errorConfig = {
          type: "first_time_login",
          message: decodedMessage || "Cần thiết lập tài khoản",
          description: decodedDescription || "Đây là lần đăng nhập đầu tiên của bạn. Bạn cần thiết lập mật khẩu trước khi có thể sử dụng hệ thống.",
          canRetry: false
        };
        break;
        
      default:
        // Keep default errorConfig
        break;
    }
    
    setErrorInfo(errorConfig);
  }, [searchParams]);

  const getErrorIcon = () => {
    switch (errorInfo.type) {
      case "oauth_login_failed":
      case "system_error":
        return <ExclamationCircleOutlined style={{ color: "#ff4d4f", fontSize: "48px" }} />;
      case "user_not_found":
      case "unauthorized_role":
        return <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: "48px" }} />;
      case "first_time_login":
        return <ExclamationCircleOutlined style={{ color: "#1890ff", fontSize: "48px" }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: "#ff4d4f", fontSize: "48px" }} />;
    }
  };

  const getAlertType = () => {
    switch (errorInfo.type) {
      case "user_not_found":
      case "unauthorized_role":
        return "warning";
      case "first_time_login":
        return "info";
      default:
        return "error";
    }
  };

  const handleRetryLogin = () => {
    navigate("/login", { replace: true });
  };

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  const handleContactAdmin = () => {
    // You can customize this to open email client or redirect to contact page
    window.location.href = "mailto:admin@schoolmedical.com?subject=Lỗi đăng nhập hệ thống&body=Tôi gặp vấn đề khi đăng nhập vào hệ thống. Chi tiết lỗi: " + encodeURIComponent(errorInfo.message);
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <Card className="error-card">
          <div className="error-icon">
            {getErrorIcon()}
          </div>
          
          <Title level={2} className="error-title">
            {errorInfo.message}
          </Title>
          
          {errorInfo.description && (
            <Paragraph className="error-description">
              {errorInfo.description}
            </Paragraph>
          )}
          
          <Alert
            type={getAlertType()}
            message="Thông tin chi tiết"
            description={
              <div>
                <Text strong>Loại lỗi:</Text> {errorInfo.type}<br/>
                <Text strong>Thời gian:</Text> {new Date().toLocaleString("vi-VN")}
              </div>
            }
            style={{ marginBottom: "24px", textAlign: "left" }}
          />
          
          <Space size="large" wrap className="error-actions">
            {errorInfo.canRetry && (
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                size="large"
                onClick={handleRetryLogin}
              >
                Thử lại đăng nhập
              </Button>
            )}
            
            <Button 
              icon={<LoginOutlined />}
              size="large"
              onClick={handleRetryLogin}
            >
              Về trang đăng nhập
            </Button>
            
            <Button 
              icon={<HomeOutlined />}
              size="large"
              onClick={handleGoHome}
            >
              Về trang chủ
            </Button>
            
            {(!errorInfo.canRetry || errorInfo.type === "system_error") && (
              <Button 
                type="default"
                size="large"
                onClick={handleContactAdmin}
              >
                Liên hệ quản trị viên
              </Button>
            )}
          </Space>
          
          {errorInfo.type === "first_time_login" && (
            <Alert
              type="info"
              message="Hướng dẫn"
              description="Bạn sẽ được tự động chuyển đến trang thiết lập tài khoản khi đăng nhập lần đầu."
              style={{ marginTop: "16px" }}
              showIcon
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ErrorPage;
