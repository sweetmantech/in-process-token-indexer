import { isRateLimitError } from './isRateLimitError.js';

/**
 * Extracts Retry-After header value or calculates delay
 * @param {Error|Object} error - The error object
 * @param {number} attempt - The current attempt number (0-indexed)
 * @param {number} baseDelay - The base delay in milliseconds
 * @returns {number} - The delay in milliseconds
 */
export const getRetryDelay = (error, attempt, baseDelay) => {
  // Check for Retry-After header in various possible locations
  const retryAfter =
    error?.response?.headers?.['retry-after'] ||
    error?.response?.headers?.['Retry-After'] ||
    error?.headers?.['retry-after'] ||
    error?.headers?.['Retry-After'];

  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds) && seconds > 0) {
      return seconds * 1000; // Convert to milliseconds
    }
  }

  // For 429 errors, use longer delays: 5s, 10s, 20s
  if (isRateLimitError(error)) {
    return 5000 * Math.pow(2, attempt); // 5s, 10s, 20s
  }

  // For other errors, use exponential backoff with base delay
  return baseDelay * Math.pow(2, attempt);
};
