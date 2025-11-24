/**
 * Extracts token pairs (address and chainId) from admin permission events.
 * Filters out events that do not have a tokenContract to avoid invalid/empty addresses.
 * @param adminEvents - Array of admin permission events.
 * @returns Array of { address: string, chainId: number } objects.
 */
export function extractTokenPairs(adminEvents) {
    // Filter out events without tokenContract before mapping to avoid invalid addresses
    const validEvents = adminEvents.filter(event => event.tokenContract && event.tokenContract.trim().length > 0);
    // Log if any events were skipped (for debugging purposes)
    if (validEvents.length < adminEvents.length) {
        const skippedCount = adminEvents.length - validEvents.length;
        console.debug(`extractTokenPairs: Skipped ${skippedCount} admin event(s) without tokenContract`);
    }
    return validEvents.map(event => ({
        address: event.tokenContract.toLowerCase(),
        chainId: event.chainId,
    }));
}
//# sourceMappingURL=extractTokenPairs.js.map