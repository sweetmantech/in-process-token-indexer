interface ArtistData {
    address: string;
    username: string;
    bio: string;
    instagram_username?: string;
    twitter_username?: string;
    telegram_username?: string;
}
/**
 * Upserts multiple artist records into the in_process_artists table.
 * @param artists - Array of artist data objects to upsert.
 * @returns The upserted records or error.
 */
export declare function upsertArtists(artists: ArtistData[]): Promise<unknown[]>;
export {};
//# sourceMappingURL=upsertArtists.d.ts.map