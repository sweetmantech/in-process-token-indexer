interface MomentEvent {
    address?: string;
    defaultAdmin?: string;
    chainId: number;
    contractURI?: string;
    blockTimestamp?: string | number;
    payoutRecipient?: string;
    [key: string]: unknown;
}
/**
 * Processes moment events in batches for better performance and memory management
 * @param network - The network name (for logging purposes)
 * @param momentEvents - Array of moment events to process
 */
export declare function processMomentsInBatches(network: string, momentEvents: MomentEvent[]): Promise<void>;
export {};
//# sourceMappingURL=processMomentsInBatches.d.ts.map