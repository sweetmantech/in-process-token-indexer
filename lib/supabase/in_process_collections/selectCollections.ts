import { supabase } from '@/lib/supabase/client';

interface SelectCollectionsOptions {
  addresses?: string[];
  order?: { column: string; ascending: boolean };
  limit?: number;
}

/**
 * Queries collections from Supabase.
 * @param options - Query options including addresses, order, and limit.
 * @returns Array of collection records.
 */
export async function selectCollections(
  options: SelectCollectionsOptions = {}
): Promise<{ id: string; address: string; chain_id: number }[]> {
  let query = supabase
    .from('in_process_collections')
    .select('id, address, chain_id');

  if (options.addresses && options.addresses.length > 0) {
    query = query.in('address', options.addresses);
  }
  if (options.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending,
    });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`❌ Failed to select collections:`, error);
    throw error;
  }

  return data || [];
}
