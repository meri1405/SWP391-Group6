import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { API_ENDPOINTS, API_BASE_URL, logCorsInfo, isDevelopment } from "../utils/api";
import "../styles/Login.css";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams();
  // Separate loading states for each button
  const [loadingStates, setLoadingStates] = useState({
    phoneOtp: false,
    otpVerify: false,
    usernameLogin: false,
    googleLogin: false,
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  // Check for OAuth2 error messages from URL parameters
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrors({ google: decodeURIComponent(error) });
    }
  }, [searchParams]);

  // Helper function to set individual loading state
  const setIndividualLoading = (key, value) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setIndividualLoading("phoneOtp", true);
    setErrors({});

    try {
      if (isDevelopment) {
        logCorsInfo(API_ENDPOINTS.auth.requestOtp);
      }

      // API call to send OTP to phone number
      const response = await fetch(API_ENDPOINTS.auth.requestOtp, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });      if (response.ok) {
        setShowOtp(true);
        // Optional: Show success message
        console.log("OTP sent successfully to", phoneNumber);
      } else {
        // Handle different HTTP status codes
        let errorMessage = "Có lỗi xảy ra khi gửi OTP";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response body is not JSON, use status-based message
          console.log("Could not parse error response as JSON:", parseError);
          if (response.status === 401) {
            errorMessage = "Chỉ tài khoản phụ huynh mới được phép đăng nhập bằng số điện thoại. Vui lòng đăng nhập bằng tài khoản nhân viên.";
          } else if (response.status === 400) {
            errorMessage = "Thông tin không hợp lệ. Vui lòng kiểm tra lại số điện thoại.";
          } else if (response.status === 404) {
            errorMessage = "Số điện thoại không tồn tại trong hệ thống.";
          }
        }
        
        // Handle specific backend error messages
        if (errorMessage.includes("Only parents can use OTP authentication") || 
            errorMessage.includes("parents") || 
            errorMessage.includes("PARENT")) {
          errorMessage = "Chỉ tài khoản phụ huynh mới được phép đăng nhập bằng số điện thoại. Vui lòng đăng nhập bằng tài khoản nhân viên.";
        } else if (errorMessage.includes("not found") || errorMessage.includes("không tồn tại")) {
          errorMessage = "Số điện thoại không tồn tại trong hệ thống.";
        } else if (errorMessage.includes("authentication") || errorMessage.includes("unauthorized")) {
          errorMessage = "Không có quyền truy cập. Vui lòng kiểm tra lại thông tin.";
        }
        
        setErrors({ phone: errorMessage });
      }
    } catch (networkError) {
      console.error("Network error:", networkError);
      setErrors({ phone: "Không thể kết nối đến server. Vui lòng thử lại." });
    } finally {
      setIndividualLoading("phoneOtp", false);
    }
  };
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setIndividualLoading("otpVerify", true);
    setErrors({});

    try {
      if (isDevelopment) {
        logCorsInfo(API_ENDPOINTS.auth.verifyOtp);
      }

      // API call to verify OTP and login
      const response = await fetch(API_ENDPOINTS.auth.verifyOtp, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("Login successful, user data:", userData);

        // Check if the user role is PARENT
        if (userData.roleName !== "PARENT") {
          // If not PARENT, show error and go back to phone input screen
          setErrors({ 
            phone: "Số điện thoại này không phải tài khoản phụ huynh. Vui lòng đăng nhập bằng tài khoản nhân viên." 
          });
          setShowOtp(false); // Go back to phone input screen
          setOtp(""); // Clear OTP field
          return;
        }

        // Transform the API response to match the expected format
        const transformedUserData = {
          token: userData.token,
          id: userData.id,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          roleName: userData.roleName,
          loginMethod: "phone", // Track that this is phone login
        };

        await login(transformedUserData);
        navigate("/parent-dashboard");      } else {
        // Handle different HTTP status codes
        let errorMessage = "Mã OTP không đúng";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response body is not JSON, use status-based message
          console.log("Could not parse error response as JSON:", parseError);
          if (response.status === 401) {
            errorMessage = "Chỉ tài khoản phụ huynh mới được phép đăng nhập bằng số điện thoại. Vui lòng đăng nhập bằng tài khoản nhân viên.";
          } else if (response.status === 400) {
            errorMessage = "Mã OTP không đúng. Vui lòng kiểm tra lại.";
          } else if (response.status === 404) {
            errorMessage = "Số điện thoại không tồn tại trong hệ thống.";
          }
        }
        
        // Handle specific backend error messages for OTP verification
        if (errorMessage.includes("Only parents can use OTP authentication") || 
            errorMessage.includes("parents") || 
            errorMessage.includes("PARENT")) {
          // If backend returns this error during OTP verification, go back to phone input
          setErrors({ 
            phone: "Số điện thoại này không phải tài khoản phụ huynh. Vui lòng đăng nhập bằng tài khoản nhân viên." 
          });
          setShowOtp(false); // Go back to phone input screen
          setOtp(""); // Clear OTP field
          return;
        } else if (errorMessage.includes("invalid") || errorMessage.includes("wrong") || errorMessage.includes("incorrect")) {
          errorMessage = "Mã OTP không đúng. Vui lòng kiểm tra lại.";
        } else if (errorMessage.includes("expired")) {
          errorMessage = "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.";
        }
        
        setErrors({ otp: errorMessage });
      }
    } catch (networkError) {
      console.error("Network error:", networkError);
      setErrors({ otp: "Không thể kết nối đến server. Vui lòng thử lại." });
    } finally {
      setIndividualLoading("otpVerify", false);
    }
  };

  const handleUsernameLogin = async (e) => {
    e.preventDefault();
    setIndividualLoading("usernameLogin", true);
    setErrors({});

    try {
      // For testing - simulate successful admin login
      if (username === "admin" && password === "admin") {
        console.log("Test admin login successful");

        const mockUserData = {
          token: "mock-jwt-token",
          id: 1,
          username: "admin",
          firstName: "Admin",
          lastName: "User",
          email: "admin@example.com",
          roleName: "ADMIN",
          loginMethod: "username",
        };

        await login(mockUserData);
        navigate("/admin/dashboard");
        return;
      }

      // Simulate API delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      // API call for username/password login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();

        // Add login method to track username/password login
        const userDataWithMethod = {
          ...userData,
          loginMethod: "username",
        };

        // Block PARENT from username/password login
        if (userData.roleName === "PARENT") {
          setErrors({
            username:
              "Tài khoản PARENT không được phép đăng nhập bằng username/password. Vui lòng sử dụng số điện thoại.",
          });
          return;
        }

        await login(userDataWithMethod);

        // Navigate to appropriate dashboard based on roleName
        switch (userData.roleName) {
          case "ADMIN":
            navigate("/admin/dashboard");
            break;
          case "SCHOOLNURSE":
            navigate("/nurse-dashboard");
            break;
          case "MANAGER":
            navigate("/manager-dashboard");
            break;
          default:
            navigate("/");
        }
      } else {
        const errorData = await response.json();
        setErrors({
          username:
            errorData.message || "Tên đăng nhập hoặc mật khẩu không đúng",
        });
      }
    } catch (networkError) {
      // Since API endpoint doesn't exist yet, simulate wrong credentials
      console.log(
        "API not available, simulating error response:",
        networkError.message
      );
      setErrors({ username: "Tên đăng nhập hoặc mật khẩu không đúng." });
    } finally {
      setIndividualLoading("usernameLogin", false);
    }
  };  const handleGoogleLogin = async () => {
    setIndividualLoading("googleLogin", true);
    setErrors({});

    try {
      if (isDevelopment) {
        logCorsInfo(API_ENDPOINTS.auth.googleOAuth);
      }      // Debug log to see the OAuth URL
      console.log("=== Google OAuth Login ===");
      console.log("API_ENDPOINTS.auth.googleOAuth:", API_ENDPOINTS.auth.googleOAuth);
      console.log("API_BASE_URL:", API_BASE_URL);
      
      // Build absolute URL for OAuth
      const oauthUrl = API_ENDPOINTS.auth.googleOAuth.startsWith('http') 
        ? API_ENDPOINTS.auth.googleOAuth 
        : `http://localhost:8080${API_ENDPOINTS.auth.googleOAuth}`;
      
      console.log("Final OAuth URL:", oauthUrl);

      // Redirect to Google OAuth endpoint
      window.location.href = oauthUrl;
    } catch (networkError) {
      console.log("Google login error:", networkError.message);
      setErrors({ google: "Không thể kết nối đến server OAuth2." });
      setIndividualLoading("googleLogin", false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img src="/medical-logo.svg" alt="Medical Logo" className="logo" />
        </div>
        <h1>Hệ Thống Quản Lý Y Tế Học Đường</h1>
        <p className="subtitle">
          Đăng nhập để truy cập hệ thống quản lý y tế học đường
        </p>
        <div className="login-columns">
          {/* Phone Login Column */}
          <div className="login-column">
            <div className="column-icon">
              <i className="fas fa-phone-alt"></i>
            </div>
            <h2>Dành cho phụ huynh</h2>
            {!showOtp ? (
              <form onSubmit={handlePhoneLogin}>
                <div className="form-group">
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={loadingStates.phoneOtp}
                  />
                  {errors.phone && (
                    <div className="error-message">{errors.phone}</div>
                  )}
                </div>
                <button
                  type="submit"
                  className="login-button"
                  disabled={loadingStates.phoneOtp}
                >
                  {loadingStates.phoneOtp ? "Đang gửi..." : "Gửi Mã OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerification}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Nhập mã OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={loadingStates.otpVerify}
                  />
                  {errors.otp && (
                    <div className="error-message">{errors.otp}</div>
                  )}
                </div>
                <button
                  type="submit"
                  className="login-button"
                  disabled={loadingStates.otpVerify}
                >
                  {loadingStates.otpVerify
                    ? "Đang xác nhận..."
                    : "Xác Nhận OTP"}
                </button>
                <button
                  type="button"
                  className="back-button"
                  onClick={() => {
                    setShowOtp(false);
                    setErrors({});
                  }}
                  disabled={loadingStates.otpVerify}
                >
                  Quay Lại
                </button>
              </form>
            )}
          </div>

          {/* Username/Password Login Column */}
          <div className="login-column">
            <div className="column-icon">
              <i className="fas fa-user-md"></i>
            </div>
            <h2>Dành cho nhân viên</h2>
            <form onSubmit={handleUsernameLogin}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loadingStates.usernameLogin}
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loadingStates.usernameLogin}
                />
                {errors.username && (
                  <div className="error-message">{errors.username}</div>
                )}
              </div>
              <a href="/forgot-password" className="forgot-password">
                Quên mật khẩu?
              </a>
              <button
                type="submit"
                className="login-button"
                disabled={loadingStates.usernameLogin}
              >
                {loadingStates.usernameLogin
                  ? "Đang đăng nhập..."
                  : "Đăng Nhập"}
              </button>
              <div className="google-login">
                <button
                  type="button"
                  className="google-button"
                  onClick={handleGoogleLogin}
                  disabled={loadingStates.googleLogin}
                >
                  <img
                    src="/google-icon.svg"
                    alt="Google"
                    className="google-icon"
                  />
                  {loadingStates.googleLogin
                    ? "Đang đăng nhập..."
                    : "Đăng nhập bằng Google"}
                </button>
                {errors.google && (
                  <div className="error-message">{errors.google}</div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
