/**
 * Utility functions for handling HTML content
 */

/**
 * Strip HTML tags from a string and return plain text
 * @param {string} html - HTML string to clean
 * @returns {string} - Plain text without HTML tags
 */
export const stripHtmlTags = (html) => {
  if (!html) return '';
  
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Return the text content (automatically strips HTML tags)
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Truncate text to a specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Clean HTML content and truncate for notification display
 * @param {string} html - HTML content from notification
 * @param {number} maxLength - Maximum length for display
 * @returns {string} - Clean, truncated text
 */
export const cleanNotificationText = (html, maxLength = 100) => {
  const plainText = stripHtmlTags(html);
  return truncateText(plainText, maxLength);
};
