import { isRateLimitError } from './isRateLimitError.js';

/**
 * Extracts Retry-After header value or calculates delay
 * @param error - The error object
 * @param attempt - The current attempt number (0-indexed)
 * @param baseDelay - The base delay in milliseconds
 * @returns The delay in milliseconds
 */
export const getRetryDelay = (
  error: unknown,
  attempt: number,
  baseDelay: number
): number => {
  if (!error || typeof error !== 'object') {
    return baseDelay * Math.pow(2, attempt);
  }

  const err = error as Record<string, unknown>;

  // Check for Retry-After header in various possible locations
  const retryAfter =
    (err.response &&
      typeof err.response === 'object' &&
      (err.response as Record<string, unknown>).headers &&
      typeof (err.response as Record<string, unknown>).headers === 'object' &&
      (
        (err.response as Record<string, unknown>).headers as Record<
          string,
          unknown
        >
      )['retry-after']) ||
    (err.response &&
      typeof err.response === 'object' &&
      (err.response as Record<string, unknown>).headers &&
      typeof (err.response as Record<string, unknown>).headers === 'object' &&
      (
        (err.response as Record<string, unknown>).headers as Record<
          string,
          unknown
        >
      )['Retry-After']) ||
    (err.headers &&
      typeof err.headers === 'object' &&
      (err.headers as Record<string, unknown>)['retry-after']) ||
    (err.headers &&
      typeof err.headers === 'object' &&
      (err.headers as Record<string, unknown>)['Retry-After']);

  if (retryAfter) {
    const seconds = parseInt(String(retryAfter), 10);
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
