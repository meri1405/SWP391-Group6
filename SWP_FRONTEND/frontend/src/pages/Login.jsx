import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSystemSettings } from "../contexts/SystemSettingsContext";
import {
  API_ENDPOINTS,
  API_BASE_URL,
  logCorsInfo,
  isDevelopment,
} from "../utils/api";
import {
  sendOTP,
  verifyOTP,
  cleanupRecaptcha,
  initializeFirebase,
  isOTPExpired,
  getOTPRemainingTime,
  resetOTPTimer,
} from "../utils/firebase";
import "../styles/Login.css";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams();
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpTimeLeft, setOtpTimeLeft] = useState(0); // Time left for OTP in seconds// Separate loading states for each button
  const [loadingStates, setLoadingStates] = useState({
    phoneOtp: false,
    otpVerify: false,
    resendOtp: false,
    usernameLogin: false,
    googleLogin: false,
  });
  const [resendSuccess, setResendSuccess] = useState(false); // Track successful resend

  const { login } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSystemSettings();  // Check for OAuth2 error messages from URL parameters
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrors({ google: decodeURIComponent(error) });
      
      // Clear the error parameter from URL after a short delay
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 100);
    } else {
      // Clear Google errors if no error in URL
      setErrors(prev => ({ ...prev, google: undefined }));
    }
  }, [searchParams, navigate]);

  // Clear all errors when component mounts
  useEffect(() => {
    setErrors({});
  }, []);

  // Clear errors when changing between login methods
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupRecaptcha();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupRecaptcha();
    };
  }, []);
  // Cleanup Firebase resources on unmount
  useEffect(() => {
    return () => {
      cleanupRecaptcha();
    };
  }, []);
  // OTP Timer countdown
  useEffect(() => {
    let interval = null;
    
    if (showOtp) {
      interval = setInterval(() => {
        const remainingTime = getOTPRemainingTime();
        setOtpTimeLeft(remainingTime);
        
        // Only show expired message if not currently verifying OTP and we have confirmation result
        if (remainingTime <= 0 && confirmationResult && !loadingStates.otpVerify) {
          setErrors({ otp: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.' });
          setConfirmationResult(null);
          resetOTPTimer();
        }
      }, 1000);
    } else {
      setOtpTimeLeft(0);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showOtp, confirmationResult, loadingStates.otpVerify]); // Add loadingStates.otpVerify to dependencies
  // Helper function to set individual loading state
  const setIndividualLoading = (key, value) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setIndividualLoading("phoneOtp", true);
    setErrors({}); // Clear previous errors
    
    // Clear any previous confirmation results and Firebase state completely
    setConfirmationResult(null);
    cleanupRecaptcha();
    
    // Wait a bit to ensure Firebase cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      // Initialize Firebase first
      await initializeFirebase();

      // Try Firebase first for OTP sending
      try {
        console.log("Attempting to send OTP via Firebase to:", phoneNumber);
        const result = await sendOTP(phoneNumber);
        setConfirmationResult(result);
        setShowOtp(true);
        console.log("Firebase OTP sent successfully to", phoneNumber);
      } catch (firebaseError) {
        console.log(
          "Firebase OTP failed, falling back to backend:",
          firebaseError
        );

        // Fallback to backend OTP generation
        if (isDevelopment) {
          logCorsInfo(API_ENDPOINTS.auth.requestOtp);
        }

        const response = await fetch(API_ENDPOINTS.auth.requestOtp, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber }),
        });

        if (response.ok) {
          setShowOtp(true);
          console.log("Backend OTP sent successfully to", phoneNumber);
        } else {
          // Handle different HTTP status codes
          let errorMessage = "Có lỗi xảy ra khi gửi OTP";

          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.log("Could not parse error response as JSON:", parseError);
            if (response.status === 401) {
              errorMessage =
                "Chỉ tài khoản phụ huynh mới được phép đăng nhập bằng số điện thoại. Vui lòng đăng nhập bằng tài khoản nhân viên.";
            } else if (response.status === 400) {
              errorMessage =
                "Thông tin không hợp lệ. Vui lòng kiểm tra lại số điện thoại.";
            } else if (response.status === 404) {
              errorMessage = "Số điện thoại không tồn tại trong hệ thống.";
            }
          }

          // Handle specific backend error messages
          if (
            errorMessage.includes("Only parents can use OTP authentication") ||
            errorMessage.includes("parents") ||
            errorMessage.includes("PARENT")
          ) {
            errorMessage =
              "Chỉ tài khoản phụ huynh mới được phép đăng nhập bằng số điện thoại. Vui lòng đăng nhập bằng tài khoản nhân viên.";
          } else if (
            errorMessage.includes("not found") ||
            errorMessage.includes("không tồn tại")
          ) {
            errorMessage = "Số điện thoại không tồn tại trong hệ thống.";
          } else if (
            errorMessage.includes("authentication") ||
            errorMessage.includes("unauthorized")
          ) {
            errorMessage =
              "Không có quyền truy cập. Vui lòng kiểm tra lại thông tin.";
          }

          setErrors({ phone: errorMessage });
        }
      }
    } catch (networkError) {
      console.error("Network error:", networkError);
      setErrors({ phone: "Không thể kết nối đến server. Vui lòng thử lại." });    } finally {
      setIndividualLoading("phoneOtp", false);
    }  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setIndividualLoading("resendOtp", true);
    setErrors({}); // Clear previous errors
    setOtp(""); // Clear current OTP input
    
    // Reset OTP timer
    resetOTPTimer();
    setOtpTimeLeft(0);
    
    // Clear any previous confirmation results and Firebase state completely
    setConfirmationResult(null);
    cleanupRecaptcha();
    
    // Wait a bit to ensure Firebase cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      // Initialize Firebase first
      await initializeFirebase();      // Try Firebase first for OTP sending
      try {        console.log("Attempting to resend OTP via Firebase to:", phoneNumber);
        const result = await sendOTP(phoneNumber);
        setConfirmationResult(result);
        console.log("Firebase OTP resent successfully to", phoneNumber);
        setErrors({ otp: undefined }); // Clear any OTP errors
        
        // Show success state
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 2000); // Reset after 2 seconds
      } catch (firebaseError) {
        console.log(
          "Firebase OTP resend failed, falling back to backend:",
          firebaseError
        );

        // Fallback to backend OTP generation
        const response = await fetch(API_ENDPOINTS.auth.requestOtp, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },          body: JSON.stringify({ phoneNumber }),
        });        if (response.ok) {
          console.log("Backend OTP resent successfully to", phoneNumber);
          setErrors({ otp: undefined }); // Clear any OTP errors
          
          // Show success state
          setResendSuccess(true);
          setTimeout(() => setResendSuccess(false), 2000); // Reset after 2 seconds
        } else {
          let errorMessage = "Có lỗi xảy ra khi gửi lại OTP";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.log("Could not parse error response as JSON:", parseError);
          }
          setErrors({ otp: errorMessage });
        }
      }
    } catch (networkError) {
      console.error("Network error:", networkError);
      setErrors({ otp: "Không thể kết nối đến server. Vui lòng thử lại." });
    } finally {
      setIndividualLoading("resendOtp", false);
      setResendSuccess(true); // Mark resend as successful
    }
  };
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setIndividualLoading("otpVerify", true);
    
    // Clear errors when starting verification, especially expiration errors
    setErrors({}); 

    try {
      let firebaseIdToken = null;
      let useBackendFallback = false;

      // Try Firebase OTP verification first if we have a confirmation result
      if (confirmationResult) {
        try {
          console.log("Attempting Firebase OTP verification");
          const firebaseResult = await verifyOTP(confirmationResult, otp);
          firebaseIdToken = firebaseResult.idToken;
          console.log("Firebase OTP verification successful");
        } catch (firebaseError) {
          console.log(
            "Firebase OTP verification failed:",
            firebaseError
          );
          
          // Check if the error is due to expiration
          if (firebaseError.message && firebaseError.message.includes('hết hạn')) {
            setErrors({ otp: firebaseError.message });
            setConfirmationResult(null);
            setIndividualLoading("otpVerify", false);
            return;
          }
          
          // Check if it's an invalid OTP error (allow retry)
          if (firebaseError.code === 'auth/invalid-verification-code' || 
              firebaseError.message.includes('invalid') ||
              firebaseError.message.includes('verification code') ||
              firebaseError.message.includes('không đúng')) {
            setErrors({ otp: 'Mã OTP không đúng. Vui lòng thử lại.' });
            setIndividualLoading("otpVerify", false);
            return; // Don't clear confirmationResult, allow retry
          }
          
          // For other errors, fall back to backend but don't clear confirmationResult yet
          console.log("Will try backend verification as fallback");
          useBackendFallback = true;
        }
      } else {
        // No confirmation result, use backend
        useBackendFallback = true;
      }

      // Choose endpoint based on whether we have Firebase token or need backend fallback
      const endpoint = firebaseIdToken && !useBackendFallback
        ? API_ENDPOINTS.auth.verifyFirebaseOtp
        : API_ENDPOINTS.auth.verifyOtp;      if (isDevelopment) {
        logCorsInfo(endpoint);
      }      const requestBody = firebaseIdToken && !useBackendFallback
        ? { phoneNumber, firebaseIdToken, otp }
        : { phoneNumber, otp };

      console.log(`Using ${firebaseIdToken && !useBackendFallback ? 'Firebase' : 'Backend'} verification for phone:`, phoneNumber);
      console.log('Request body:', requestBody);
      console.log('Endpoint:', endpoint);

      // API call to verify OTP and login
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("Login successful, user data:", userData);

        // Check if the user role is PARENT
        if (userData.roleName !== "PARENT") {
          // If not PARENT, show error and go back to phone input screen
          setErrors({
            phone:
              "Số điện thoại này không phải tài khoản phụ huynh. Vui lòng đăng nhập bằng tài khoản nhân viên.",
          });
          setShowOtp(false); // Go back to phone input screen
          setOtp(""); // Clear OTP field
          cleanupRecaptcha(); // Clean up Firebase state
          setConfirmationResult(null);
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
          loginMethod: firebaseIdToken ? "firebase" : "phone", // Track login method
        };

        await login(transformedUserData);
        navigate("/parent-dashboard");
      } else {
        // Handle different HTTP status codes
        let errorMessage = "Mã OTP không đúng";

        try {
          const errorData = await response.json();
          if (errorData.message && errorData.message.includes("Account is disabled")) {
            errorMessage = "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.";
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          // If response body is not JSON, use status-based message
          console.log("Could not parse error response as JSON:", parseError);
          if (response.status === 401) {
            errorMessage = "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại OTP.";
          } else if (response.status === 400) {
            errorMessage = "Mã OTP không đúng. Vui lòng kiểm tra lại.";
          } else if (response.status === 404) {
            errorMessage = "Số điện thoại không tồn tại trong hệ thống.";
          }
        }

        // Handle specific backend error messages for OTP verification
        if (
          errorMessage.includes("Only parents can use OTP authentication") ||
          errorMessage.includes("parents") ||
          errorMessage.includes("PARENT")
        ) {
          // If backend returns this error during OTP verification, go back to phone input
          setErrors({
            phone:
              "Số điện thoại này không phải tài khoản phụ huynh. Vui lòng đăng nhập bằng tài khoản nhân viên.",
          });
          setShowOtp(false); // Go back to phone input screen
          setOtp(""); // Clear OTP field
          return;
        } else if (
          errorMessage.includes("Account is disabled")
        ) {
          // Handle disabled account specifically
          setErrors({ otp: errorMessage });
        } else if (
          errorMessage.includes("invalid") ||
          errorMessage.includes("wrong") ||
          errorMessage.includes("incorrect") ||
          errorMessage.includes("không đúng")
        ) {
          errorMessage = "Mã OTP không đúng. Vui lòng kiểm tra lại.";
          // Don't clear confirmationResult for invalid OTP, allow retry
        } else if (errorMessage.includes("expired") || response.status === 401) {
          errorMessage = "Mã OTP đã hết hạn hoặc không hợp lệ. Vui lòng bấm 'Gửi lại OTP' để nhận mã mới.";
          setConfirmationResult(null); // Clear for expired OTP
        } else if (errorMessage.includes("used") || errorMessage.includes("already")) {
          errorMessage = "Mã OTP này đã được sử dụng. Vui lòng bấm 'Gửi lại OTP' để nhận mã mới.";
          setConfirmationResult(null); // Clear for used OTP
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
    setErrors({}); // Clear previous errors

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

      // Use the configured API endpoint
      const loginUrl = API_ENDPOINTS.auth.login;
      console.log("Attempting login to:", loginUrl);

      // API call for username/password login
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log("Login response status:", response.status);
      console.log("Login response headers:", [...response.headers.entries()]);

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
        }

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
        }      } else {
        // Handle error responses
        let errorMessage = "Tên đăng nhập hoặc mật khẩu không hợp lệ";
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            if (errorData.message.includes("Account is disabled")) {
              errorMessage = "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.";
            } else if (errorData.message.includes("Bad credentials")) {
              errorMessage = "Tên đăng nhập hoặc mật khẩu không hợp lệ";
            } else {
              errorMessage = errorData.message;
            }
          }
        } catch (parseError) {
          // If can't parse error response, use default message
          console.log("Could not parse error response:", parseError);
        }

        setErrors({ username: errorMessage });
      }
    } catch (networkError) {
      console.log("Network error during login:", networkError.message);

      // For any network or connection errors, show the simple error message
      setErrors({
        username: "Tên đăng nhập hoặc mật khẩu không hợp lệ",
      });
    } finally {
      setIndividualLoading("usernameLogin", false);
    }
  };
  const handleGoogleLogin = async () => {
    setIndividualLoading("googleLogin", true);
    setErrors({}); // Clear previous errors
    
    // Clear URL parameters to prevent error persistence
    if (searchParams.has('error')) {
      navigate('/login', { replace: true });
    }

    try {
      if (isDevelopment) {
        logCorsInfo(API_ENDPOINTS.auth.googleOAuth);
      }
      // Debug log to see the OAuth URL
      console.log("=== Google OAuth Login ===");
      console.log(
        "API_ENDPOINTS.auth.googleOAuth:",
        API_ENDPOINTS.auth.googleOAuth
      );
      console.log("API_BASE_URL:", API_BASE_URL);

      // Build absolute URL for OAuth
      const oauthUrl = API_ENDPOINTS.auth.googleOAuth.startsWith("http")
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
        <h1>{settings.systemName}</h1>
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
                <div className="form-group">                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      // Clear phone errors when user starts typing
                      if (errors.phone) {
                        setErrors(prev => ({ ...prev, phone: undefined }));
                      }
                    }}
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
              <form onSubmit={handleOtpVerification}>                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Nhập mã OTP"
                    value={otp}                    onChange={(e) => {
                      setOtp(e.target.value);
                      // Only clear OTP errors when user starts typing if not currently verifying
                      if (errors.otp && !loadingStates.otpVerify) {
                        setErrors(prev => ({ ...prev, otp: undefined }));
                      }
                    }}
                    onFocus={() => {
                      // Only clear errors when user focuses on input if not currently verifying
                      if (errors.otp && !errors.otp.includes('hết hạn') && !loadingStates.otpVerify) {
                        setErrors(prev => ({ ...prev, otp: undefined }));
                      }
                    }}
                    required
                    disabled={loadingStates.otpVerify || isOTPExpired()}
                  />                  {/* OTP Timer Display */}
                  {otpTimeLeft > 0 && (
                    <div className={`otp-timer ${otpTimeLeft <= 30 ? 'expired' : 'active'}`}>
                      Mã OTP sẽ hết hạn sau: {Math.floor(otpTimeLeft / 60)}:{(otpTimeLeft % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                  {errors.otp && (
                    <div className="error-message">{errors.otp}</div>
                  )}
                </div>                <button
                  type="submit"
                  className="login-button"
                  disabled={loadingStates.otpVerify || isOTPExpired()}
                  style={isOTPExpired() ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {}}
                >
                  {loadingStates.otpVerify
                    ? "Đang xác nhận..."
                    : isOTPExpired() 
                    ? "Mã OTP đã hết hạn"
                    : "Xác Nhận OTP"}
                </button>                <button
                  type="button"
                  className={`resend-otp-button ${loadingStates.resendOtp ? 'loading' : ''} ${
                    resendSuccess ? 'success' : 
                    isOTPExpired() ? 'urgent' : 
                    otpTimeLeft > 0 && otpTimeLeft <= 30 ? 'can-resend' : ''
                  }`}
                  onClick={handleResendOtp}
                  disabled={loadingStates.resendOtp || loadingStates.otpVerify}
                >
                  {loadingStates.resendOtp ? "Đang gửi lại..." : 
                   resendSuccess ? "✓ Đã gửi thành công!" :
                   isOTPExpired() ? "Gửi lại OTP (Đã hết hạn)" : "Gửi lại OTP"}
                </button><button
                  type="button"
                  className="back-button"
                  onClick={() => {
                    // Only reset OTP-related state, keep phone number
                    setShowOtp(false);
                    setOtp(""); // Clear OTP input
                    setErrors({}); // Clear all errors
                    cleanupRecaptcha(); // Clean Firebase state (this also resets OTP timer)
                    setConfirmationResult(null); // Clear confirmation result
                    setOtpTimeLeft(0); // Reset timer display
                    
                    // Force clear any cached Firebase auth state
                    setTimeout(() => {
                      cleanupRecaptcha();
                    }, 100);
                    
                    // Reset OTP loading state
                    setIndividualLoading("otpVerify", false);
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
              <div className="form-group">                <input
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    // Clear username errors when user starts typing
                    if (errors.username) {
                      setErrors(prev => ({ ...prev, username: undefined }));
                    }
                  }}
                  required
                  disabled={loadingStates.usernameLogin}
                />
              </div>
              <div className="form-group">                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear username errors when user starts typing password
                    if (errors.username) {
                      setErrors(prev => ({ ...prev, username: undefined }));
                    }
                  }}
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
          </div>{" "}
        </div>
      </div>
      {/* reCAPTCHA container for Firebase */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;
