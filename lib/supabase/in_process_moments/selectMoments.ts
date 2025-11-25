import { supabase } from '../client';
import { InProcessMoment } from '@/types/moments';

/**
 * Queries moments from Supabase by collection addresses and token IDs.
 * Returns moments with their associated collection data.
 * @param collectionAddresses - Array of collection addresses (case-insensitive matching).
 * @param tokenIds - Array of token IDs to filter by.
 * @returns Array of moment records with id, token_id, and collection data.
 */
export async function selectMoments(
  collectionAddresses: string[],
  tokenIds: number[]
): Promise<InProcessMoment[]> {
  if (collectionAddresses.length === 0 || tokenIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('in_process_moments')
    .select(
      'id, token_id, collection:in_process_collections!inner(id, address, chain_id)'
    )
    .in('collection.address', collectionAddresses)
    .in('token_id', tokenIds);

  if (error) {
    console.error('❌ Failed to select moments:', error);
    throw error;
  }

  return (data as InProcessMoment[]) || [];
}
