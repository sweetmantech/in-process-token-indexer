interface PaymentEvent {
    transactionHash?: string;
    spender?: string;
    amount?: string;
    blockNumber?: string;
    collection?: string;
    currency?: string;
    [key: string]: unknown;
}
/**
 * Processes payment events in batches for better performance and memory management
 * @param network - The network name (for logging purposes)
 * @param paymentEvents - Array of payment events to process
 */
export declare function processPaymentsInBatches(network: string, paymentEvents: PaymentEvent[]): Promise<void>;
export {};
//# sourceMappingURL=processPaymentsInBatches.d.ts.map