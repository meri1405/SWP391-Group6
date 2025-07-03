import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset, verifyOtp, resetPassword } from '../api/userApi';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const response = await requestPasswordReset(email);
    
    if (response.ok) {
      setStep(2);
    } else {
      switch (response.status) {
        case 403:
          setError('Rất tiếc, email bạn nhập không đủ điều kiện để đặt lại mật khẩu. Vui lòng kiểm tra và thử lại.');
          break;
        case 404:
          setError('Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.');
          break;
        case 500:
          setError('Không thể gửi mã OTP. Vui lòng thử lại sau.');
          break;
        default:
          setError(response.data?.message || 'Không thể gửi yêu cầu reset mật khẩu. Vui lòng thử lại sau.');
      }
    }
    
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const response = await verifyOtp(email, otp);
    
    if (response.ok) {
      setStep(3);
    } else {
      switch (response.status) {
        case 403:
          setError('Rất tiếc, email bạn nhập không đủ điều kiện để đặt lại mật khẩu. Vui lòng kiểm tra và thử lại.');
          break;
        case 400:
          setError('Mã OTP không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại hoặc yêu cầu mã mới.');
          break;
        default:
          setError(response.data?.message || 'Không thể xác thực mã OTP. Vui lòng thử lại.');
      }
    }
    
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    const response = await resetPassword(email, otp, newPassword);
    
    if (response.ok) {
      navigate('/login?resetSuccess=true');
    } else {
      switch (response.status) {
        case 403:
          setError('Rất tiếc, email bạn nhập không đủ điều kiện để đặt lại mật khẩu. Vui lòng kiểm tra và thử lại.');
          break;
        case 400:
          setError('Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thực hiện lại quá trình reset mật khẩu.');
          setStep(1);
          break;
        default:
          setError(response.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
      }
    }
    
    setLoading(false);
  };

  // Add resend OTP functionality
  const handleResendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setError('Mã OTP mới đã được gửi đến email của bạn.');
    } catch (err) {
      console.error('Resend OTP error:', err);
      if (err.response) {
        switch (err.response.status) {
          case 403:
            setError('Tài khoản của bạn không được phép sử dụng tính năng reset mật khẩu.');
            break;
          case 500:
            setError('Không thể gửi mã OTP mới. Vui lòng thử lại sau.');
            break;
          default:
            setError(err.response.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
        }
      } else {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit}>
            <h2>Quên mật khẩu</h2>
            <p className='otp-instruction'>Nhập email của bạn để nhận mã OTP</p>
            <div className="form-group">
              <input
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
            <button type="button" className="back-button" onClick={() => navigate('/login')}>
              Quay lại đăng nhập
            </button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleOtpSubmit}>
            <h2>Xác thực OTP</h2>
            <p className='otp-instruction'>Nhập mã OTP đã được gửi đến email của bạn</p>
            <div className="form-group">
              <input
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
            </button>
            <button 
              type="button" 
              className="resend-button"
              onClick={handleResendOtp}
              disabled={loading}
            >
              {loading ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
            </button>
            <button type="button" className="back-button" onClick={() => setStep(1)}>
              Quay lại
            </button>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handlePasswordSubmit}>
            <h2>Đặt lại mật khẩu</h2>
            <p className='otp-instruction'>Nhập mật khẩu mới của bạn</p>
            <div className="form-group password-field">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex="-1"
              >
                <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            <div className="form-group password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
            <button type="button" className="back-button" onClick={() => setStep(2)}>
              Quay lại
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <div className="logo-container">
          <img src="/medical-logo.svg" alt="Medical Logo" className="logo" />
        </div>
        {error && <div className="error-message">{error}</div>}
        {renderStep()}
      </div>
    </div>
  );
};

export default ForgotPassword; 