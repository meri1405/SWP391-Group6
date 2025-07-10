import React from "react";
import { Button, Card, Typography, Space } from "antd";
import { ExclamationCircleOutlined, ReloadOutlined, HomeOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and save error info
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <Card style={{
            textAlign: "center",
            padding: "40px 24px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "none",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            maxWidth: "600px",
            width: "100%"
          }}>
            <div style={{ marginBottom: "24px" }}>
              <ExclamationCircleOutlined style={{ color: "#ff4d4f", fontSize: "48px" }} />
            </div>
            
            <Title level={2} style={{ color: "#262626", marginBottom: "16px" }}>
              Oops! Đã xảy ra lỗi
            </Title>
            
            <Paragraph style={{ fontSize: "16px", color: "#595959", marginBottom: "24px" }}>
              Ứng dụng đã gặp lỗi không mong đợi. Chúng tôi rất xin lỗi về sự bất tiện này.
            </Paragraph>
            
            {import.meta.env.DEV && (
              <div style={{
                background: "#f5f5f5",
                padding: "16px",
                borderRadius: "6px",
                marginBottom: "24px",
                textAlign: "left"
              }}>
                <details>
                  <summary style={{ cursor: "pointer", fontWeight: "600", marginBottom: "8px" }}>
                    Chi tiết lỗi (Development Mode)
                  </summary>
                  <pre style={{ 
                    fontSize: "12px", 
                    overflow: "auto", 
                    maxHeight: "200px",
                    margin: 0,
                    color: "#d32f2f"
                  }}>
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}
            
            <Space size="large" wrap>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                size="large"
                onClick={this.handleReload}
              >
                Tải lại trang
              </Button>
              
              <Button 
                icon={<HomeOutlined />}
                size="large"
                onClick={this.handleGoHome}
              >
                Về trang chủ
              </Button>
            </Space>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
