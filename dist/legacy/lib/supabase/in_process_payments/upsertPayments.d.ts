export interface PaymentData {
    hash: string;
    buyer: string;
    token: string | null;
    amount?: number | null;
    block?: number | null;
    collection?: string;
    currency?: string;
    [key: string]: unknown;
}
/**
 * Upserts multiple payment records into the in_process_payments table.
 * @param payments - Array of payment data objects to upsert.
 * @returns The upserted records or error.
 */
export declare function upsertPayments(payments: PaymentData[]): Promise<unknown[]>;
//# sourceMappingURL=upsertPayments.d.ts.map