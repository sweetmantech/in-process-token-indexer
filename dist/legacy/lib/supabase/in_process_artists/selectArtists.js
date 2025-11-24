import { supabase } from '../client.js';
export async function selectArtists(addresses, fields = '*') {
    if (!addresses || addresses.length === 0) {
        return [];
    }
    // Get unique addresses and normalize to lowercase
    const uniqueAddresses = [
        ...new Set(addresses.map(addr => addr.toLowerCase())),
    ];
    const { data, error } = await supabase
        .from('in_process_artists')
        .select(fields)
        .in('address', uniqueAddresses);
    if (error) {
        throw new Error(`Failed to select artists: ${error.message}`);
    }
    // Type assertion for 'address' field case
    if (fields === 'address') {
        return (data || []);
    }
    return data || [];
}
//# sourceMappingURL=selectArtists.js.map