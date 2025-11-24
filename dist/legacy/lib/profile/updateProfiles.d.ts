interface DecodedLog {
    args: {
        defaultAdmin: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
/**
 * Updates artist profiles in the in_process_artists table based on decoded logs.
 * @param decodedLogs - Array of decoded log objects.
 */
export default function updateProfiles(decodedLogs: DecodedLog[]): Promise<void>;
export {};
//# sourceMappingURL=updateProfiles.d.ts.map