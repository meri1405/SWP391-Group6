/**
 * User role constants and utilities
 */

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  SCHOOLNURSE: 'SCHOOLNURSE',
  PARENT: 'PARENT'
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.MANAGER]: 'Quản lý',
  [USER_ROLES.SCHOOLNURSE]: 'Y tá',
  [USER_ROLES.PARENT]: 'Phụ huynh'
};

export const ROLE_COLORS = {
  [USER_ROLES.ADMIN]: 'red',
  [USER_ROLES.MANAGER]: 'orange',
  [USER_ROLES.SCHOOLNURSE]: 'gold',
  [USER_ROLES.PARENT]: 'blue'
};

export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: 'Quản trị hệ thống, cấu hình và bảo mật',
  [USER_ROLES.MANAGER]: 'Quản lý tổng thể hệ thống y tế trường học',
  [USER_ROLES.SCHOOLNURSE]: 'Quản lý sức khỏe học sinh, xử lý các vấn đề y tế',
  [USER_ROLES.PARENT]: 'Theo dõi sức khỏe con em'
};

export const ROLE_JOB_TITLES = {
  [USER_ROLES.ADMIN]: 'Quản trị viên hệ thống',
  [USER_ROLES.MANAGER]: 'Quản lý',
  [USER_ROLES.SCHOOLNURSE]: 'Y tá trường học',
  [USER_ROLES.PARENT]: 'Phụ huynh học sinh'
};

/**
 * Get minimum age for a role
 * @param {string} role - User role
 * @returns {number} - Minimum age
 */
export const getMinAgeForRole = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.MANAGER:
    case USER_ROLES.SCHOOLNURSE:
      return 25;
    case USER_ROLES.PARENT:
      return 16;
    default:
      return 16;
  }
};

/**
 * Get maximum age for a role
 * @param {string} role - User role
 * @returns {number} - Maximum age
 */
export const getMaxAgeForRole = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.MANAGER:
    case USER_ROLES.SCHOOLNURSE:
    case USER_ROLES.PARENT:
      return 100;
    default:
      return 100;
  }
};

/**
 * Check if role requires staff credentials
 * @param {string} role - User role
 * @returns {boolean} - True if staff role
 */
export const isStaffRole = (role) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SCHOOLNURSE].includes(role);
};

/**
 * Get job title for a role
 * @param {string} role - User role
 * @returns {string} - Job title
 */
export const getJobTitleForRole = (role) => {
  return ROLE_JOB_TITLES[role] || '';
};
