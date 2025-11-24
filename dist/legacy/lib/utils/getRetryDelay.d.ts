/**
 * Extracts Retry-After header value or calculates delay
 * @param error - The error object
 * @param attempt - The current attempt number (0-indexed)
 * @param baseDelay - The base delay in milliseconds
 * @returns The delay in milliseconds
 */
export declare const getRetryDelay: (error: unknown, attempt: number, baseDelay: number) => number;
//# sourceMappingURL=getRetryDelay.d.ts.map