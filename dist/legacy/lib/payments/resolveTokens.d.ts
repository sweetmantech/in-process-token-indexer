interface PaymentWithCollection {
    collection?: string;
    currency?: string;
    [key: string]: unknown;
}
interface PaymentWithToken extends PaymentWithCollection {
    token: string | null;
}
/**
 * Resolves token IDs for payments based on collection or currency
 * @param payments - Array of payment objects with collection/currency info
 * @returns Payments with resolved token IDs
 */
export declare function resolveTokensForPayments(payments: PaymentWithCollection[]): Promise<PaymentWithToken[]>;
export {};
//# sourceMappingURL=resolveTokens.d.ts.map