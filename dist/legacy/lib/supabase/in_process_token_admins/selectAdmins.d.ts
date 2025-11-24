/**
 * Selects the most recent admin from the in_process_token_admins table for a given chainId.
 * @param chainId - The chain ID to filter by.
 * @param limit - Maximum number of records to return (default: 1).
 * @returns An array of admin objects with token relation, may be empty if none exist.
 */
export declare function selectAdmins(chainId: number, limit?: number): Promise<unknown[]>;
//# sourceMappingURL=selectAdmins.d.ts.map