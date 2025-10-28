import { supabase } from '../client.js';

/**
 * Selects artists from the in_process_artists table by their addresses.
 * @param {Array<string>} addresses - Array of artist addresses to select.
 * @param {string} fields - Fields to select (default: "*" for all fields).
 * @returns {Promise<Array<Object>>} - Array of artist objects with their data.
 */
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

  return data || [];
}
