"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectArtists = selectArtists;
const client_1 = require("../client");
async function selectArtists(addresses, fields = '*') {
    if (!addresses || addresses.length === 0) {
        return [];
    }
    // Get unique addresses and normalize to lowercase
    const uniqueAddresses = [
        ...new Set(addresses.map(addr => addr.toLowerCase())),
    ];
    const { data, error } = await client_1.supabase
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
