interface SplitRecipient {
    address: string;
    percentAllocation: string;
}
interface RetryOptions {
    maxRetries?: number;
    retryDelay?: number;
}
/**
 * Gets the recipient addresses (recipients) from a split contract address.
 * Uses the 0xSplits SDK to fetch split metadata which includes recipients.
 * @param splitAddress - The split contract address
 * @param chainId - The chain ID
 * @param options - Retry options
 * @param options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param options.retryDelay - Initial retry delay in milliseconds (default: 100)
 * @returns Array of recipients or null if failed/not a split
 */
export declare const getSplitRecipients: (splitAddress: `0x${string}`, chainId: number, options?: RetryOptions) => Promise<SplitRecipient[] | null>;
export {};
//# sourceMappingURL=getSplitRecipients.d.ts.map