/**
 * Checks if error is a 429 rate limit error
 * @param error - The error object to check
 * @returns True if the error is a rate limit error
 */
export const isRateLimitError = (error) => {
    if (!error || typeof error !== 'object') {
        return false;
    }
    const err = error;
    return !!(err.status === 429 ||
        err.statusCode === 429 ||
        err.code === 429 ||
        (typeof err.message === 'string' && err.message.includes('429')) ||
        (typeof err.message === 'string' &&
            err.message.toLowerCase().includes('rate limit')) ||
        (err.response &&
            typeof err.response === 'object' &&
            err.response.status === 429));
};
//# sourceMappingURL=isRateLimitError.js.map