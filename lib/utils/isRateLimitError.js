/**
 * Checks if error is a 429 rate limit error
 * @param {Error|Object} error - The error object to check
 * @returns {boolean} - True if the error is a rate limit error
 */
export const isRateLimitError = error => {
  return (
    error?.status === 429 ||
    error?.statusCode === 429 ||
    error?.code === 429 ||
    error?.message?.includes('429') ||
    error?.message?.toLowerCase().includes('rate limit') ||
    error?.response?.status === 429
  );
};
