interface MaxTimestampResult {
    maxTimestamp: number;
    chainId: number;
}
/**
 * Gets the maximum createdAt timestamp from the in_process_token_admins table grouped by chainId.
 * @returns Array of objects with chainId and maxTimestamp properties.
 */
export declare function getMaxBlockTimestamp(): Promise<MaxTimestampResult[]>;
export {};
//# sourceMappingURL=getMaxBlockTimestamp.d.ts.map