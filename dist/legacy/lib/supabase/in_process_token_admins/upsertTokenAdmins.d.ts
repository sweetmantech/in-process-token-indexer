export interface TokenAdminData {
    token: string;
    artist_address: string;
    [key: string]: unknown;
}
/**
 * Upserts multiple token admin records into the in_process_token_admins table.
 * @param tokenAdmins - Array of token admin data objects to upsert.
 * Each object should have: { token: string, artist_address: string }
 * @returns The upserted records or error.
 */
export declare function upsertTokenAdmins(tokenAdmins: TokenAdminData[]): Promise<unknown[]>;
//# sourceMappingURL=upsertTokenAdmins.d.ts.map