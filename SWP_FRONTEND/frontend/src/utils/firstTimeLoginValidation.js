/**
 * Utility functions for first-time login form validation
 */

/**
 * Check password strength and provide feedback
 * @param {string} password - Password to check
 * @returns {Object} Password strength information
 */
export const checkPasswordStrength = (password) => {
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

/**
 * Validate password meets minimum requirements
 * @param {string} password - Password to validate
 * @returns {boolean} True if password is valid
 */
export const validatePassword = (password) => {
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

/**
 * Validate username meets requirements
 * @param {string} username - Username to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateUsername = (username) => {
  const trimmedUsername = username?.trim();
  
  if (!trimmedUsername) {
    return {
      isValid: false,
      message: "Vui lòng nhập tên đăng nhập!"
    };
  }

  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    return {
      isValid: false,
      message: "Tên đăng nhập phải từ 3-30 ký tự!"
    };
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(trimmedUsername)) {
    return {
      isValid: false,
      message: "Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm, gạch dưới và gạch ngang!"
    };
  }

  return {
    isValid: true,
    message: ""
  };
};

/**
 * Validate form data for first-time login
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateFirstTimeLoginForm = (formData) => {
  const { newPassword, confirmPassword, newUsername } = formData;

  // Validate password
  if (!validatePassword(newPassword)) {
    return {
      isValid: false,
      message: "Mật khẩu phải đạt độ mạnh 'Trung bình' trở lên!"
    };
  }

  // Validate password confirmation
  if (newPassword !== confirmPassword) {
    return {
      isValid: false,
      message: "Mật khẩu xác nhận không khớp!"
    };
  }

  // Validate username
  const usernameValidation = validateUsername(newUsername);
  if (!usernameValidation.isValid) {
    return usernameValidation;
  }

  return {
    isValid: true,
    message: ""
  };
};

/**
 * Form rules for Ant Design Form validation
 */
export const getFormRules = () => {
  return {
    otp: [
      { required: true, message: "Vui lòng nhập mã OTP!" },
      { len: 6, message: "Mã OTP phải có 6 chữ số!" }
    ],
    newUsername: [
      { required: true, message: "Vui lòng nhập tên đăng nhập!" },
      { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
      { max: 30, message: "Tên đăng nhập không được quá 30 ký tự!" },
      {
        pattern: /^[a-zA-Z0-9._-]+$/,
        message: "Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm, gạch dưới và gạch ngang!"
      }
    ],
    newPassword: [
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
    ],
    confirmPassword: (getFieldValue) => [
      { required: true, message: "Vui lòng xác nhận mật khẩu!" },
      {
        validator(_, value) {
          if (!value || getFieldValue('newPassword') === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
        },
      },
    ]
  };
};
