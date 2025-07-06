/**
 * Password validation utilities
 */

/**
 * Validates if password meets minimum requirements
 * @param {string} password - The password to validate
 * @returns {boolean} - True if password is valid
 */
export const validatePassword = (password) => {
  if (!password) return false;

  // Check length and spaces
  const hasValidLength = password.length >= 8 && password.length <= 50;
  const noSpaces = !password.includes(" ");

  if (!hasValidLength || !noSpaces) return false;

  // Calculate score based on criteria
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;

  // Accept password from "Medium" strength and above (score >= 3)
  return score >= 3;
};

/**
 * Gets password strength information
 * @param {string} password - The password to analyze
 * @returns {Object} - Object containing score, text, color, and feedback
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, text: "", color: "", feedback: "" };

  let score = 0;
  let feedback = [];

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push("ít nhất 8 ký tự");

  // Lowercase check
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("chữ thường");

  // Uppercase check
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("chữ hoa");

  // Number check
  if (/\d/.test(password)) score += 1;
  else feedback.push("số");

  // Special character check
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
    feedback:
      score >= 3
        ? score === 5
          ? "Mật khẩu mạnh!"
          : "Mật khẩu đạt yêu cầu!"
        : `Cần thêm: ${feedback.join(", ")}`,
  };
};
