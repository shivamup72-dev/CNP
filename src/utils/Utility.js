/* Utility function for universal date formatting */
/**
 * Format a date object or date string into a standardized display format
 * @param {Date|string} date - Date object or date string to format
 * @param {string} format - Format type: 'short', 'long', 'time', 'datetime', 'api', 'date-only'
 * @returns {string} Formatted date string
 * eg-
 * // Short format (default)
 * formatDate("2024-03-20") => "20 Mar, 2024"
 * formatDate(new Date(), 'short') => "20 Mar, 2024"
 * 
 * // Long format
 * formatDate("2024-03-20", 'long') => "20 March, 2024"
 * 
 * // Time format
 * formatDate("2024-03-20T14:30:00", 'time') => "14:30"
 * 
 * // Datetime format
 * formatDate("2024-03-20T14:30:00", 'datetime') => "20 Mar, 2024, 14:30"
 * 
 * // API format (ISO string)
 * formatDate(new Date(), 'api') => "2024-03-20T14:30:00.000Z"
 * 
 * // Date-only format
 * formatDate(new Date(), 'date-only') => "2024-03-20"
 * 
 * // Invalid or empty input
 * formatDate("") => ""
 * formatDate("invalid-date") => "Invalid date"
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';

  // Create a Date object if the input is a string
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return 'Invalid date';

  // Special case for API format (ISO string)
  if (format === 'api') {
    return dateObj.toISOString();
  }

  // Special case for date-only format (YYYY-MM-DD)
  if (format === 'date-only') {
    return dateObj.toISOString().split('T')[0];
  }

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
    }
  };

  // Get the format options
  const formatOptions = formats[format] || formats.short;

  // Format the date
  return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
};


/* Utility function for trimming whitespaces & capitalizing first letter of each word */
/** 
 * @param {string} str - The input string to format
 * @returns {string} The formatted string with trimmed whitespace and capitalized words
 * eg-
 * capitalizeFirstLetter("john doe") => "John Doe"
 * capitalizeFirstLetter("  hello world  ") => "Hello World"
 * capitalizeFirstLetter("") => ""
 * capitalizeFirstLetter("ground_zero") => "Ground_zero"
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str
    .trim()
    .split(' ')
    .filter(word => word) // Remove empty strings from multiple spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};