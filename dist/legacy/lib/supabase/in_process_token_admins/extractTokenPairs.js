/**
 * Extracts token pairs (address and chainId) from admin permission events.
 * @param adminEvents - Array of admin permission events.
 * @returns Array of { address: string, chainId: number } objects.
 */
export function extractTokenPairs(adminEvents) {
    return adminEvents.map(event => ({
        address: event.tokenContract?.toLowerCase() || '',
        chainId: event.chainId,
    }));
}
//# sourceMappingURL=extractTokenPairs.js.map