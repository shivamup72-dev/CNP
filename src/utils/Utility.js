/**
 * Utility functions for text processing
 */

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The input string
 * @returns {string} The string with its first letter capitalized
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str - The input string
 * @returns {string} The string with first letter of each word capitalized
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formats a name (first and last) with proper capitalization.
 * @param {string} name - The full name to format
 * @returns {string} The formatted name
 */
export const formatName = (name) => {
  if (!name) return '';
  return capitalizeWords(name.trim());
};
