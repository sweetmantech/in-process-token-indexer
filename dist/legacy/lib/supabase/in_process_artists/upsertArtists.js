"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertArtists = upsertArtists;
const client_1 = require("../client");
/**
 * Upserts multiple artist records into the in_process_artists table.
 * @param artists - Array of artist data objects to upsert.
 * @returns The upserted records; throws on error.
 */
async function upsertArtists(artists) {
    const { data, error } = await client_1.supabase
        .from('in_process_artists')
        .upsert(artists, { onConflict: 'address' })
        .select();
    if (error) {
        throw error;
    }
    return data || [];
}
