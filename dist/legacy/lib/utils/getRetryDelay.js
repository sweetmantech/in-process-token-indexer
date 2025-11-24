"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRetryDelay = void 0;
const isRateLimitError_1 = require("./isRateLimitError");
/**
 * Extracts Retry-After header value or calculates delay
 * @param error - The error object
 * @param attempt - The current attempt number (0-indexed)
 * @param baseDelay - The base delay in milliseconds
 * @returns The delay in milliseconds
 */
const getRetryDelay = (error, attempt, baseDelay) => {
    if (!error || typeof error !== 'object') {
        return baseDelay * Math.pow(2, attempt);
    }
    const err = error;
    // Check for Retry-After header in various possible locations
    const retryAfter = (err.response &&
        typeof err.response === 'object' &&
        err.response.headers &&
        typeof err.response.headers === 'object' &&
        err.response.headers['retry-after']) ||
        (err.response &&
            typeof err.response === 'object' &&
            err.response.headers &&
            typeof err.response.headers === 'object' &&
            err.response.headers['Retry-After']) ||
        (err.headers &&
            typeof err.headers === 'object' &&
            err.headers['retry-after']) ||
        (err.headers &&
            typeof err.headers === 'object' &&
            err.headers['Retry-After']);
    if (retryAfter) {
        const seconds = parseInt(String(retryAfter), 10);
        if (!isNaN(seconds) && seconds > 0) {
            return seconds * 1000; // Convert to milliseconds
        }
    }
    // For 429 errors, use longer delays: 5s, 10s, 20s
    if ((0, isRateLimitError_1.isRateLimitError)(error)) {
        return 5000 * Math.pow(2, attempt); // 5s, 10s, 20s
    }
    // For other errors, use exponential backoff with base delay
    return baseDelay * Math.pow(2, attempt);
};
exports.getRetryDelay = getRetryDelay;
