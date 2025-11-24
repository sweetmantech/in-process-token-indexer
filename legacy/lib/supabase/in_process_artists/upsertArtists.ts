import { supabase } from '../client.js';

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
export async function upsertArtists(artists: ArtistData[]): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('in_process_artists')
    .upsert(artists, { onConflict: 'address' })
    .select();

  if (error) {
    throw error;
  }
  return data || [];
}
