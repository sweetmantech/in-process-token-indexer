import { supabase } from '../client';

interface ArtistData {
  address: string;
  username: string;
  bio: string;
  instagram_username?: string;
  twitter_username?: string;
  telegram_username?: string;
}

export interface UpsertedArtist {
  address: string;
  username: string | null;
  bio: string | null;
  instagram_username: string | null;
  twitter_username: string | null;
  telegram_username: string | null;
  farcaster_username: string | null;
  smart_wallet: string | null;
  [key: string]: unknown;
}

/**
 * Upserts multiple artist records into the in_process_artists table.
 * @param artists - Array of artist data objects to upsert.
 * @returns The upserted records; throws on error.
 */
export async function upsertArtists(
  artists: ArtistData[]
): Promise<UpsertedArtist[]> {
  const { data, error } = await supabase
    .from('in_process_artists')
    .upsert(artists, { onConflict: 'address' })
    .select();

  if (error) {
    throw error;
  }
  return data || [];
}
