interface AdminEvent {
    tokenContract?: string;
    chainId: number;
    user?: string;
    blockTimestamp?: string | number;
    [key: string]: unknown;
}
/**
 * Processes admin permission events in batches for better performance and memory management
 * @param network - The network name (for logging purposes)
 * @param adminEvents - Array of admin permission events to process
 */
export declare function processAdminsInBatches(network: string, adminEvents: AdminEvent[]): Promise<void>;
export {};
//# sourceMappingURL=processAdminsInBatches.d.ts.map