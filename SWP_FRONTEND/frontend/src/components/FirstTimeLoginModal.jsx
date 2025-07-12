import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Typography, Steps, Alert } from "antd";
import { LockOutlined, MailOutlined, SafetyOutlined, UserOutlined } from "@ant-design/icons";
import { useFirstTimeLogin } from "../hooks/useFirstTimeLogin";
import { getFormRules } from "../utils/firstTimeLoginValidation";

const { Title, Text } = Typography;
const { Step } = Steps;

const FirstTimeLoginModal = ({ 
  visible, 
  email,
  currentUsername,
  isGoogleLogin = false,
  onComplete, 
  onCancel 
}) => {
  const [form] = Form.useForm();
  
  // Use the custom hook for managing state and logic
  const {
    currentStep,
    loading,
    timeLeft,
    passwordStrength,
    handleSendOtp,
    handleResendOtp,
    handleSubmit,
    handlePasswordChange,
    formatTime
  } = useFirstTimeLogin({ 
    visible, 
    email, 
    currentUsername, 
    onComplete 
  });

  const formRules = getFormRules();

  // Reset form when modal opens/closes or currentUsername changes
  useEffect(() => {
    if (visible && currentUsername) {
      form.setFieldsValue({
        newUsername: currentUsername
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [visible, currentUsername, form]);
      // Handle form submission with validation
  const onFinish = async (values) => {
    await handleSubmit(values);
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>
          <SafetyOutlined style={{ color: "#1890ff", fontSize: "24px", marginRight: "8px" }} />
          <Title level={4} style={{ margin: 0, display: "inline" }}>
            Thiết lập mật khẩu và tên đăng nhập
          </Title>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      maskClosable={false}
      centered
    >
      <Alert
        message="Lưu ý quan trọng"
        description={
          isGoogleLogin 
            ? "Đây là lần đăng nhập Google đầu tiên của bạn. Vì lý do bảo mật, bạn cần đổi mật khẩu và xác thực qua email trước khi sử dụng hệ thống."
            : "Đây là lần đăng nhập đầu tiên của bạn. Vì lý do bảo mật, bạn cần đổi mật khẩu và xác thực qua email trước khi sử dụng hệ thống."
        }
        type="warning"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      <Steps current={currentStep} style={{ marginBottom: "32px" }}>
        <Step title="Gửi OTP" icon={<MailOutlined />} />
        <Step title="Đổi thông tin" icon={<LockOutlined />} />
      </Steps>

      {currentStep === 0 && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Text style={{ fontSize: "16px", marginBottom: "16px", display: "block" }}>
            Chúng tôi sẽ gửi mã OTP đến email: <strong>{email}</strong>
          </Text>
          <Button
            type="primary"
            size="large"
            icon={<MailOutlined />}
            onClick={handleSendOtp}
            loading={loading}
            style={{ marginTop: "16px" }}
          >
            Gửi mã OTP
          </Button>
        </div>
      )}

      {currentStep === 1 && (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Mã OTP"
            name="otp"
            rules={formRules.otp}
          >
            <Input
              placeholder="Nhập mã OTP 6 chữ số"
              maxLength={6}
              style={{ fontSize: "18px", textAlign: "center", letterSpacing: "4px" }}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>

          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            {timeLeft > 0 ? (
              <Text type="secondary">
                Mã OTP sẽ hết hạn sau: <strong style={{ color: "#1890ff" }}>{formatTime(timeLeft)}</strong>
              </Text>
            ) : (
              <div>
                <Text type="danger">Mã OTP đã hết hạn!</Text>
                <br />
                <Button type="link" onClick={handleResendOtp} loading={loading}>
                  Gửi lại mã OTP
                </Button>
              </div>
            )}
          </div>

          <Form.Item
            label="Tên đăng nhập mới"
            name="newUsername"
            rules={formRules.newUsername}
            extra="Bạn có thể giữ nguyên tên đăng nhập hiện tại hoặc thay đổi thành tên mới"
          >
            <Input
              placeholder="Nhập tên đăng nhập mới"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={formRules.newPassword}
          >
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </Form.Item>

          {passwordStrength.score > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Text style={{ color: passwordStrength.color, fontSize: "12px" }}>
                Độ mạnh: {passwordStrength.text} - {passwordStrength.feedback}
              </Text>
            </div>
          )}

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={formRules.confirmPassword(form.getFieldValue)}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
              style={{ marginTop: "16px" }}
            >
              Xác nhận đổi thông tin
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default FirstTimeLoginModal;
