import { Database } from '@/lib/supabase/types';
import { supabase } from '../client';

/**
 * Queries collections from Supabase by their addresses.
 * @param addresses - Array of collection addresses (case-insensitive matching).
 * @returns Array of collection records with id, address, and chain_id.
 */
export async function selectCollections(
  addresses: string[]
): Promise<
  Array<
    Pick<
      Database['public']['Tables']['in_process_collections']['Row'],
      'id' | 'address' | 'chain_id'
    >
  >
> {
  if (addresses.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('in_process_collections')
    .select('id, address, chain_id')
    .in('address', addresses);

  if (error) {
    console.error(`❌ Failed to select collections by addresses:`, error);
    throw error;
  }

  return data || [];
}
