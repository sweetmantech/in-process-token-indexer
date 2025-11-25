import { supabase } from '../client';

/**
 * Gets the collection ID from Supabase using address and chain_id.
 * Used to resolve collection references when mapping moments.
 * @param address - Collection address.
 * @param chainId - Chain ID.
 * @returns Collection ID string, or null if not found.
 */
export async function getCollectionId(
  address: string,
  chainId: number
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('in_process_collections')
      .select('id')
      .eq('address', address)
      .eq('chain_id', chainId)
      .single();

    if (error) {
      // If no records found, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data?.id || null;
  } catch (error) {
    console.error(
      `❌ Failed to fetch collection ID for ${address} on chain ${chainId}:`,
      error
    );
    return null;
  }
}

