import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

/**
 * Upserts an array of artists into the 'in_process_artists' table.
 * All fields are upserted based on address (PK).
 * @param artists Array of artist records to upsert.
 * @returns Array of upserted artists (as returned by Supabase).
 */
export async function upsertArtists(
  artists: Database['public']['Tables']['in_process_artists']['Insert'][]
): Promise<void> {
  if (!artists.length) return;

  try {
    const { error } = await supabase
      .from('in_process_artists')
      .upsert(artists, { onConflict: 'address' });

    if (error) {
      console.error('❌ upsertArtists: Supabase error:', error);
      throw error;
    }
    console.log(`💾 upsertArtists: Upserted ${artists.length} artists`);
  } catch (err) {
    console.error('❌ upsertArtists: Exception during upsert:', err);
    throw err;
  }
}
