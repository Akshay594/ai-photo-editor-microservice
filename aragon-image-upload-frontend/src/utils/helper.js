/**
 * Format date to readable format
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} - Formatted date
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  /**
   * Truncate text if it exceeds a certain length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} - Truncated text
   */
  export const truncateText = (text, maxLength = 25) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };
  
  /**
   * Generate a unique ID
   * @returns {string} - Unique ID
   */
  export const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  /**
   * Delay execution with a promise
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} - Promise that resolves after the delay
   */
  export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  export default {
    formatDate,
    truncateText,
    generateId,
    delay
  };