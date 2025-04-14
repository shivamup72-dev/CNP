/**
 * DateUtility.js - Common date utility functions for the application
 */

/**
 * Format a date object or date string into a standardized display format
 * @param {Date|string} date - Date object or date string to format
 * @param {string} format - Format type: 'short', 'long', 'time', 'datetime'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';

  // Create a Date object if the input is a string
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return 'Invalid date';

  // Format options for different display types
  const formats = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },      // 1 Jan, 2023
    long: { day: 'numeric', month: 'long', year: 'numeric' },        // 1 January, 2023
    time: { hour: '2-digit', minute: '2-digit' },                    // 14:30
    datetime: {                                                      // 1 Jan, 2023, 14:30
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    dateWithDay: {                                                   // Mon, 1 Jan, 2023
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    },
    numeric: { day: '2-digit', month: '2-digit', year: 'numeric' },  // 01/01/2023
    relative: 'relative'                                             // 2 days ago, just now, etc.
  };

  // If format is 'relative', use relative time formatting
  if (format === 'relative') {
    return getRelativeTime(dateObj);
  }

  // Get the format options
  const formatOptions = formats[format] || formats.short;

  // Format the date
  return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
};

/**
 * Get relative time string (like "2 days ago" or "just now")
 * @param {Date} date - Date to compare against current time
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return 'just now';
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // If older than a week, return formatted date
  return formatDate(date, 'short');
};

/**
 * Parse a date string in various formats into a Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Format date for backend API requests (ISO format)
 * @param {Date|string} date - Date to format
 * @returns {string} ISO formatted date string
 */
export const formatDateForAPI = (date) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toISOString();
};

/**
 * Get the date range for a specific time period (last week, last month, etc.)
 * @param {string} period - Time period: 'day', 'week', 'month', 'year'
 * @returns {Object} Object with start and end dates
 */
export const getDateRange = (period) => {
  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case 'day':
      start.setDate(now.getDate() - 1);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 7); // Default to week
  }

  return {
    start,
    end: now
  };
}; 