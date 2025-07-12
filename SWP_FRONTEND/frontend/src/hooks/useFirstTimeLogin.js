import { useState, useEffect } from "react";
import { message } from "antd";
import { FirstTimeLoginService } from "../services/firstTimeLoginService";
import { 
  checkPasswordStrength, 
  validateFirstTimeLoginForm 
} from "../utils/firstTimeLoginValidation";

/**
 * Custom hook for managing first-time login modal state and logic
 * @param {Object} params - Hook parameters
 * @param {boolean} params.visible - Modal visibility
 * @param {string} params.email - User's email
 * @param {string} params.currentUsername - Current username
 * @param {Function} params.onComplete - Callback when process is complete
 * @returns {Object} Hook state and handlers
 */
export const useFirstTimeLogin = ({ visible, email, currentUsername, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "", color: "" });

  // Reset state when modal opens/closes or currentUsername changes
  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
      setTimeLeft(0);
      setPasswordStrength({ score: 0, text: "", color: "" });
    }
  }, [visible, currentUsername]);

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

  /**
   * Handle sending OTP
   */
  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const result = await FirstTimeLoginService.sendOtp(email);
      if (result.success) {
        setTimeLeft(300); // 5 minutes
        setCurrentStep(1);
        message.success(result.message);
      } else {
        message.error(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle resending OTP
   */
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const result = await FirstTimeLoginService.resendOtp(email);
      if (result.success) {
        setTimeLeft(300); // Reset to 5 minutes
        message.success(result.message);
      } else {
        message.error(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form submission
   * @param {Object} formData - Form data
   */
  const handleSubmit = async (formData) => {
    try {
      // Validate form data
      const validation = validateFirstTimeLoginForm(formData);
      if (!validation.isValid) {
        message.error(validation.message);
        return;
      }

      setLoading(true);
      const result = await FirstTimeLoginService.verifyOtpAndChangeCredentials(
        email,
        formData.otp,
        formData.newPassword,
        formData.newUsername.trim()
      );

      if (result.success) {
        message.success(result.message);
        onComplete();
      } else {
        message.error(result.message);
      }
    } catch {
      message.error("Vui lòng điền đầy đủ thông tin.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle password change for strength checking
   * @param {string} password - New password
   */
  const handlePasswordChange = (password) => {
    setPasswordStrength(checkPasswordStrength(password));
  };

  /**
   * Format time for countdown display
   * @param {number} seconds - Seconds to format
   * @returns {string} Formatted time string
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // State
    currentStep,
    loading,
    timeLeft,
    passwordStrength,
    
    // Handlers
    handleSendOtp,
    handleResendOtp,
    handleSubmit,
    handlePasswordChange,
    
    // Utilities
    formatTime
  };
};
