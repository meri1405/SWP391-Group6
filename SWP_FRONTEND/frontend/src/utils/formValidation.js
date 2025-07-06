/**
 * Form validation utilities
 */

/**
 * Validate Vietnamese name (first name or last name)
 * @param {string} value - Name value
 * @returns {Object} - Validation result
 */
export const validateVietnameseName = (value) => {
  if (!value) return { isValid: false, message: 'Tên không được để trống' };
  
  const trimmed = value.trim();
  if (trimmed.length < 2) return { isValid: false, message: 'Tên phải có ít nhất 2 ký tự' };
  if (trimmed.length > 50) return { isValid: false, message: 'Tên không được quá 50 ký tự' };
  
  // Vietnamese name pattern: letters, spaces, and Vietnamese diacritics
  const vietnameseNamePattern = /^[a-zA-ZÀ-ỹ\s]+$/;
  if (!vietnameseNamePattern.test(trimmed)) {
    return { isValid: false, message: 'Tên chỉ được chứa chữ cái và khoảng trắng' };
  }
  
  // Check for extra spaces
  if (trimmed !== value) {
    return { isValid: false, message: 'Không được có khoảng trắng thừa ở đầu hoặc cuối' };
  }
  
  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(value)) {
    return { isValid: false, message: 'Không được có nhiều khoảng trắng liên tiếp' };
  }
  
  return { isValid: true };
};

/**
 * Validate Vietnamese phone number
 * @param {string} value - Phone number value
 * @returns {Object} - Validation result
 */
export const validateVietnamesePhone = (value) => {
  if (!value) return { isValid: false, message: 'Số điện thoại không được để trống' };
  
  // Vietnamese phone pattern: starts with 03, 05, 07, 08, 09 and has 10 digits total
  const phonePattern = /^(0[3|5|7|8|9])[0-9]{8}$/;
  if (!phonePattern.test(value)) {
    return { isValid: false, message: 'Số điện thoại không hợp lệ (VD: 0901234567)' };
  }
  
  if (value.length !== 10) {
    return { isValid: false, message: 'Số điện thoại phải có đúng 10 chữ số' };
  }
  
  return { isValid: true };
};

/**
 * Validate email address
 * @param {string} value - Email value
 * @returns {Object} - Validation result
 */
export const validateEmail = (value) => {
  if (!value) return { isValid: false, message: 'Email không được để trống' };
  
  const trimmed = value.trim();
  if (trimmed.length > 100) {
    return { isValid: false, message: 'Email không được quá 100 ký tự' };
  }
  
  // Check for spaces
  if (value.includes(' ')) {
    return { isValid: false, message: 'Email không được chứa khoảng trắng' };
  }
  
  // Check for extra spaces
  if (trimmed !== value) {
    return { isValid: false, message: 'Email không được có khoảng trắng ở đầu hoặc cuối' };
  }
  
  // Email pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(trimmed)) {
    return { isValid: false, message: 'Định dạng email không hợp lệ' };
  }
  
  return { isValid: true };
};

/**
 * Validate address
 * @param {string} value - Address value
 * @returns {Object} - Validation result
 */
export const validateAddress = (value) => {
  if (!value) return { isValid: false, message: 'Địa chỉ không được để trống' };
  
  const trimmed = value.trim();
  if (trimmed.length < 10) return { isValid: false, message: 'Địa chỉ phải có ít nhất 10 ký tự' };
  if (trimmed.length > 200) return { isValid: false, message: 'Địa chỉ không được quá 200 ký tự' };
  
  // Address pattern: letters, numbers, spaces, and common punctuation
  const addressPattern = /^[a-zA-ZÀ-ỹ0-9\s.,/\-()]+$/;
  if (!addressPattern.test(trimmed)) {
    return { isValid: false, message: 'Địa chỉ chỉ được chứa chữ cái, số và các ký tự . , / - ( )' };
  }
  
  // Check for extra spaces
  if (trimmed !== value) {
    return { isValid: false, message: 'Không được có khoảng trắng thừa ở đầu hoặc cuối' };
  }
  
  // Check for too many consecutive spaces
  if (/\s{3,}/.test(value)) {
    return { isValid: false, message: 'Không được có quá 2 khoảng trắng liên tiếp' };
  }
  
  return { isValid: true };
};

/**
 * Validate username
 * @param {string} value - Username value
 * @returns {Object} - Validation result
 */
export const validateUsername = (value) => {
  if (!value) return { isValid: false, message: 'Tên đăng nhập không được để trống' };
  
  const trimmed = value.trim();
  if (trimmed.length < 3) return { isValid: false, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' };
  if (trimmed.length > 30) return { isValid: false, message: 'Tên đăng nhập không được quá 30 ký tự' };
  
  // Username pattern: starts with letter, can contain letters, numbers, underscore
  const usernamePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  if (!usernamePattern.test(trimmed)) {
    return { isValid: false, message: 'Tên đăng nhập phải bắt đầu bằng chữ cái và chỉ chứa chữ cái, số, và dấu gạch dưới' };
  }
  
  // Check for spaces
  if (value.includes(' ')) {
    return { isValid: false, message: 'Tên đăng nhập không được chứa khoảng trắng' };
  }
  
  return { isValid: true };
};

/**
 * Create Ant Design validator from validation function
 * @param {Function} validationFn - Validation function
 * @param {Array} existingUsers - Array of existing users for duplicate checking
 * @param {string} field - Field name for duplicate checking
 * @param {string} currentUserId - Current user ID (for edit mode)
 * @returns {Function} - Ant Design validator
 */
export const createAntdValidator = (validationFn, existingUsers = [], field = null, currentUserId = null) => {
  return (_, value) => {
    if (!value) return Promise.resolve();
    
    const result = validationFn(value);
    if (!result.isValid) {
      return Promise.reject(new Error(result.message));
    }
    
    // Check for duplicates if field is specified
    if (field && existingUsers.length > 0) {
      const duplicate = existingUsers.find(user => 
        user[field] === value && user.id !== currentUserId
      );
      if (duplicate) {
        const fieldName = field === 'email' ? 'Email' : 
                         field === 'phone' ? 'Số điện thoại' : 
                         field === 'username' ? 'Tên đăng nhập' : 'Trường';
        return Promise.reject(new Error(`${fieldName} này đã được sử dụng bởi người dùng khác!`));
      }
    }
    
    return Promise.resolve();
  };
};