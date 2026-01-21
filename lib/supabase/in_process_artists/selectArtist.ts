import { Database } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase/client';

interface SelectArtistParams {
  telegram_username: string;
}

/**
 * Queries an artist from Supabase by telegram username.
 * @param param - Query parameter including telegram_username.
 * @returns Artist record or null if not found.
 */
export async function selectArtist(
  param: SelectArtistParams
): Promise<Database['public']['Tables']['in_process_artists']['Row'] | null> {
  const { telegram_username } = param;

  const { data, error } = await supabase
    .from('in_process_artists')
    .select('*')
    .eq('telegram_username', telegram_username)
    .maybeSingle();

  if (error) {
    console.error('❌ Failed to select artist:', error);
    throw error;
  }

  return data || null;
}
