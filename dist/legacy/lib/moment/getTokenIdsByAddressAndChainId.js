"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenIdsByAddressAndChainId = getTokenIdsByAddressAndChainId;
const selectTokens_1 = require("../supabase/in_process_tokens/selectTokens");
const validateTokenRecords_1 = require("./validateTokenRecords");
/**
 * Gets token IDs from in_process_tokens table by address and chainId pairs.
 * @param tokenPairs - Array of { address: string, chainId: number } objects.
 * @returns Map with key "address-chainId" and value as token id (uuid).
 */
async function getTokenIdsByAddressAndChainId(tokenPairs) {
    if (!tokenPairs || tokenPairs.length === 0) {
        return new Map();
    }
    // Get unique addresses and normalize to lowercase
    const uniqueAddresses = [
        ...new Set(tokenPairs
            .map(pair => pair.address?.toLowerCase())
            .filter(Boolean)),
    ];
    if (uniqueAddresses.length === 0) {
        return new Map();
    }
    // Query tokens by addresses
    const rawData = await (0, selectTokens_1.selectTokens)({
        addresses: uniqueAddresses,
        fields: 'id, address, chainId',
    });
    // Validate and filter the returned data
    const data = (0, validateTokenRecords_1.validateTokenRecords)(rawData);
    // Create a map of address-chainId -> id
    const tokenIdMap = new Map();
    if (data) {
        data.forEach(token => {
            const key = `${token.address.toLowerCase()}-${token.chainId}`;
            tokenIdMap.set(key, token.id);
        });
    }
    return tokenIdMap;
}
