import { supabase } from '../client.js';
/**
 * Upserts multiple artist records into the in_process_artists table.
 * @param artists - Array of artist data objects to upsert.
 * @returns The upserted records; throws on error.
 */
export async function upsertArtists(artists) {
    const { data, error } = await supabase
        .from('in_process_artists')
        .upsert(artists, { onConflict: 'address' })
        .select();
    if (error) {
        throw error;
    }
    return data || [];
}
//# sourceMappingURL=upsertArtists.js.map