interface TokenPair {
    address: string;
    chainId: number;
}
/**
 * Gets token IDs from in_process_tokens table by address and chainId pairs.
 * @param tokenPairs - Array of { address: string, chainId: number } objects.
 * @returns Map with key "address-chainId" and value as token id (uuid).
 */
export declare function getTokenIdsByAddressAndChainId(tokenPairs: TokenPair[]): Promise<Map<string, string>>;
export {};
//# sourceMappingURL=getTokenIdsByAddressAndChainId.d.ts.map