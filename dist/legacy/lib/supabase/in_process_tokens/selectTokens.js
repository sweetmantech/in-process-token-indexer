import { supabase } from '../client.js';
/**
 * Selects tokens from the in_process_tokens table.
 * @param options - Query options.
 * @param options.addresses - Array of token addresses to filter by.
 * @param options.chainId - Chain ID to filter by.
 * @param options.fields - Fields to select (default: "*" for all fields).
 * @param options.limit - Maximum number of tokens to return.
 * @param options.orderBy - Ordering options with field and ascending properties.
 * @returns Array of token objects with their data.
 */
export async function selectTokens({ addresses, chainId, fields = '*', limit, orderBy, } = {}) {
    let query = supabase.from('in_process_tokens').select(fields);
    // Filter by addresses if provided
    if (addresses && addresses.length > 0) {
        const uniqueAddresses = [
            ...new Set(addresses.map(addr => addr.toLowerCase())),
        ];
        query = query.in('address', uniqueAddresses);
    }
    // Filter by chainId if provided
    if (chainId !== undefined) {
        query = query.eq('chainId', chainId);
    }
    // Apply ordering if provided
    if (orderBy) {
        query = query.order(orderBy.field, {
            ascending: orderBy.ascending !== false,
        });
    }
    // Apply limit if provided
    if (limit !== undefined) {
        query = query.limit(limit);
    }
    const { data, error } = await query;
    if (error) {
        throw new Error(`Failed to select tokens: ${error.message}`);
    }
    return data || [];
}
//# sourceMappingURL=selectTokens.js.map