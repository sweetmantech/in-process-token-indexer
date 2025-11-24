interface SelectTokensOptions {
    addresses?: string[];
    chainId?: number;
    fields?: string;
    limit?: number;
    orderBy?: {
        field: string;
        ascending?: boolean;
    };
}
/**
 * Selects tokens from the in_process_tokens table.
 * @param options - Query options.
 * @param options.addresses - Array of token addresses to filter by.
 * @param options.chainId - Chain ID to filter by.
 * @param options.fields - Fields to select (default: "*" for all fields).
 * @param options.limit - Maximum number of tokens to return.
 * @param options.orderBy - Ordering options with field and ascending properties.
 * @returns Array of token objects with their data.
 */
export declare function selectTokens({ addresses, chainId, fields, limit, orderBy, }?: SelectTokensOptions): Promise<unknown[]>;
export {};
//# sourceMappingURL=selectTokens.d.ts.map