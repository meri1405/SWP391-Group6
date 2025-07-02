// Phone Validator for Vietnamese mobile numbers
// Utility function to validate phone numbers in the frontend

// List of valid Vietnamese mobile prefixes
export const VIETNAMESE_MOBILE_PREFIXES = [
  // Viettel
  "086", "096", "097", "098", "032", "033", "034", "035", "036", "037", "038", "039",
  // Mobifone
  "070", "079", "077", "076", "078", "089",
  // Vinaphone
  "081", "082", "083", "084", "085", "088",
  // Vietnamobile
  "056", "058", "059",
  // Gmobile
  "052", "099"
];

/**
 * Validates a Vietnamese mobile phone number
 * - Must start with 0
 * - Must be 10 digits
 * - Must have a valid Vietnamese mobile prefix
 * 
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const isValidVietnamesePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return false;
  }

  // Remove spaces and hyphens
  const cleanPhone = phone.replace(/\s+|-/g, '');

  // Check length and starting digit
  if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
    return false;
  }

  // Check prefix
  const prefix = cleanPhone.substring(0, 3);
  return VIETNAMESE_MOBILE_PREFIXES.includes(prefix);
};

/**
 * Validates a phone number and returns an error message if invalid
 * 
 * @param {string} phone - The phone number to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return 'Số điện thoại không được để trống';
  }

  // Remove spaces and hyphens
  const cleanPhone = phone.replace(/\s+|-/g, '');

  if (cleanPhone.length !== 10) {
    return 'Số điện thoại phải có đúng 10 chữ số';
  }

  if (!cleanPhone.startsWith('0')) {
    return 'Số điện thoại phải bắt đầu bằng số 0';
  }

  // Check prefix
  const prefix = cleanPhone.substring(0, 3);
  if (!VIETNAMESE_MOBILE_PREFIXES.includes(prefix)) {
    return 'Số điện thoại không đúng định dạng. Vui lòng nhập đúng đầu số điện thoại Việt Nam';
  }

  return null; // Phone is valid
};

/**
 * Format for displaying list of prefixes by provider
 * Useful for error messages or documentation
 */
export const formatPrefixesByProvider = () => {
  return `
    Viettel: 086, 096, 097, 098, 032, 033, 034, 035, 036, 037, 038, 039
    Mobifone: 070, 079, 077, 076, 078, 089
    Vinaphone: 081, 082, 083, 084, 085, 088
    Vietnamobile: 056, 058, 059
    Gmobile: 052, 099
  `;
};
