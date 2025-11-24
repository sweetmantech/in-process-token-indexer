interface PaymentEvent {
    transactionHash?: string;
    spender?: string;
    amount?: string;
    blockNumber?: string;
    collection?: string;
    currency?: string;
    [key: string]: unknown;
}
interface SupabasePaymentData {
    hash: string;
    buyer: string;
    amount: number | null;
    block: number | null;
    collection?: string;
    currency?: string;
    token: null;
}
/**
 * Maps payment events from GRPC to Supabase format for in_process_payments table.
 * @param payments - Array of payment events from GRPC.
 * @returns The mapped objects for Supabase upsert.
 */
export declare function mapPaymentsToSupabase(payments: PaymentEvent[]): SupabasePaymentData[];
export {};
//# sourceMappingURL=mapPaymentsToSupabase.d.ts.map