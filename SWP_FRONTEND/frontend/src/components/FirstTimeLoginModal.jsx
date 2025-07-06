import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Typography, Steps, Alert } from "antd";
import { LockOutlined, MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { sendOtpForPasswordChange, verifyOtpAndChangePassword } from "../api/userApi";

const { Title, Text } = Typography;
const { Step } = Steps;

const FirstTimeLoginModal = ({ 
  visible, 
  email, 
  onComplete, 
  onCancel 
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "", color: "" });

  // Timer for OTP countdown
  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, text: "", color: "" };

    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push("ít nhất 8 ký tự");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("chữ thường");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("chữ hoa");

    if (/\d/.test(password)) score += 1;
    else feedback.push("số");

    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push("ký tự đặc biệt");

    const strengthLevels = [
      { text: "Rất yếu", color: "#ff4d4f" },
      { text: "Yếu", color: "#ff7a45" },
      { text: "Trung bình", color: "#ffa940" },
      { text: "Khá", color: "#52c41a" },
      { text: "Mạnh", color: "#389e0d" },
    ];

    return {
      score,
      text: strengthLevels[score] ? strengthLevels[score].text : "Rất yếu",
      color: strengthLevels[score] ? strengthLevels[score].color : "#ff4d4f",
      feedback: score >= 3 
        ? score === 5 
          ? "Mật khẩu mạnh!" 
          : "Mật khẩu đạt yêu cầu!"
        : `Cần thêm: ${feedback.join(", ")}`,
    };
  };

  const validatePassword = (password) => {
    if (!password) return false;
    const hasValidLength = password.length >= 8 && password.length <= 50;
    const noSpaces = !password.includes(" ");
    if (!hasValidLength || !noSpaces) return false;

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;

    return score >= 3;
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const result = await sendOtpForPasswordChange(email);
      if (result.ok) {
        setOtpSent(true);
        setTimeLeft(300); // 5 minutes
        setCurrentStep(1);
        message.success("Mã OTP đã được gửi đến email của bạn!");
      } else {
        message.error(result.data?.message || "Không thể gửi OTP. Vui lòng thử lại.");
      }
    } catch (error) {
      message.error("Lỗi hệ thống. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const result = await sendOtpForPasswordChange(email);
      if (result.ok) {
        setTimeLeft(300); // Reset to 5 minutes
        message.success("Mã OTP mới đã được gửi!");
      } else {
        message.error(result.data?.message || "Không thể gửi lại OTP.");
      }
    } catch (error) {
      message.error("Lỗi hệ thống. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!validatePassword(values.newPassword)) {
        message.error("Mật khẩu phải đạt độ mạnh 'Trung bình' trở lên!");
        return;
      }

      if (values.newPassword !== values.confirmPassword) {
        message.error("Mật khẩu xác nhận không khớp!");
        return;
      }

      setLoading(true);
      const result = await verifyOtpAndChangePassword(email, values.otp, values.newPassword);
      
      if (result.ok) {
        message.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        onComplete();
      } else {
        message.error(result.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
      }
    } catch (error) {
      message.error("Vui lòng điền đầy đủ thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>
          <SafetyOutlined style={{ color: "#1890ff", fontSize: "24px", marginRight: "8px" }} />
          <Title level={4} style={{ margin: 0, display: "inline" }}>
            Thiết lập mật khẩu lần đầu
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
        description="Đây là lần đăng nhập đầu tiên của bạn. Vì lý do bảo mật, bạn cần đổi mật khẩu và xác thực qua email trước khi sử dụng hệ thống."
        type="warning"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      <Steps current={currentStep} style={{ marginBottom: "32px" }}>
        <Step title="Gửi OTP" icon={<MailOutlined />} />
        <Step title="Đổi mật khẩu" icon={<LockOutlined />} />
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
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Mã OTP"
            name="otp"
            rules={[
              { required: true, message: "Vui lòng nhập mã OTP!" },
              { len: 6, message: "Mã OTP phải có 6 chữ số!" }
            ]}
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
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
              { max: 50, message: "Mật khẩu không được quá 50 ký tự!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (value.includes(" ")) {
                    return Promise.reject(new Error("Mật khẩu không được chứa khoảng trắng!"));
                  }
                  if (!validatePassword(value)) {
                    return Promise.reject(new Error("Mật khẩu phải đạt độ mạnh 'Trung bình' trở lên!"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              onChange={(e) => setPasswordStrength(checkPasswordStrength(e.target.value))}
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
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
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
              Xác nhận đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default FirstTimeLoginModal;
