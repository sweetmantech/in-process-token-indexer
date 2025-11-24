/**
 * Selects artists from the in_process_artists table by their addresses.
 * @param addresses - Array of artist addresses to select.
 * @param fields - Fields to select (default: "*" for all fields).
 * @returns Array of artist objects with their data.
 */
export declare function selectArtists(addresses: string[], fields: 'address'): Promise<Array<{
    address: string;
}>>;
export declare function selectArtists(addresses: string[], fields?: string): Promise<unknown[]>;
//# sourceMappingURL=selectArtists.d.ts.map