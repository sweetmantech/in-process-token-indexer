interface QueryVariables {
    chainId: number;
    [key: string]: unknown;
}
interface IndexerConfig {
    name: string;
    network?: string;
    grpcEndpoint: string;
    batchSize?: number;
    pollInterval?: number;
    errorRetryDelay?: number;
    query: string;
    dataPath: string;
    processFunction: (network: string, events: unknown[]) => Promise<void>;
    getQueryVariables?: () => Promise<QueryVariables[]>;
}
/**
 * Factory class for creating indexers with common functionality
 * Abstracts the polling, error handling, and logging patterns used by both payments and moments indexers
 */
export declare class IndexerFactory {
    private config;
    constructor(config: IndexerConfig);
    /**
     * Utility method to create consistent log messages
     */
    private _log;
    /**
     * Utility method for sleep/delay functionality
     */
    private _sleep;
    /**
     * Processes events and logs the results consistently
     */
    private _processEvents;
    /**
     * Starts the indexer with polling loop
     */
    start(): Promise<never>;
    /**
     * Polls for new events and processes them
     */
    private _pollForEvents;
    /**
     * Processes events for multiple chains
     */
    private _processMultipleChains;
    /**
     * Handles errors with logging and retry delay
     */
    private _handleError;
}
export {};
//# sourceMappingURL=IndexerFactory.d.ts.map