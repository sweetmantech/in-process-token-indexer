"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexerFactory = void 0;
const logForBaseOnly_1 = require("./logForBaseOnly");
const queryAllEvents_1 = require("./grpc/queryAllEvents");
const getNetwork_1 = require("./viem/getNetwork");
/**
 * Factory class for creating indexers with common functionality
 * Abstracts the polling, error handling, and logging patterns used by both payments and moments indexers
 */
class IndexerFactory {
    constructor(config) {
        this.config = {
            name: config.name,
            network: config.network || 'base',
            grpcEndpoint: config.grpcEndpoint,
            batchSize: config.batchSize || 1000,
            pollInterval: config.pollInterval || 30000, // 30 seconds
            errorRetryDelay: config.errorRetryDelay || 60000, // 1 minute
            query: config.query,
            dataPath: config.dataPath,
            processFunction: config.processFunction,
            getQueryVariables: config.getQueryVariables || (async () => []),
        };
    }
    /**
     * Utility method to create consistent log messages
     */
    _log(message) {
        const { network } = this.config;
        (0, logForBaseOnly_1.logForBaseOnly)(network, message);
    }
    /**
     * Utility method for sleep/delay functionality
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Processes events and logs the results consistently
     */
    async _processEvents(events, chainId = null) {
        const { name, processFunction } = this.config;
        const network = (0, getNetwork_1.getNetwork)(chainId);
        this._log(`${network} - Querying ${name} from GRPC endpoint...`);
        this._log(`Starting ${name} indexer for ${network}...`);
        if (events.length > 0) {
            const chainText = chainId ? ` for chainId ${chainId}` : '';
            const totalText = chainId ? ' total' : '';
            this._log(`${network} - Found ${events.length}${totalText} ${name} events${chainText}`);
            await processFunction((0, getNetwork_1.getNetwork)(chainId), events);
        }
        else {
            this._log(`${network} - No new ${name} events found`);
        }
    }
    /**
     * Starts the indexer with polling loop
     */
    async start() {
        while (true) {
            try {
                await this._pollForEvents();
            }
            catch (error) {
                await this._handleError(error);
            }
        }
    }
    /**
     * Polls for new events and processes them
     */
    async _pollForEvents() {
        const { pollInterval, getQueryVariables } = this.config;
        const queryVariables = await getQueryVariables();
        // Process events for multiple chains
        await this._processMultipleChains(queryVariables);
        // Poll at specified interval
        await this._sleep(pollInterval);
    }
    /**
     * Processes events for multiple chains
     */
    async _processMultipleChains(queryVariables) {
        const { name, network, grpcEndpoint, batchSize, query, dataPath } = this.config;
        for (const chainVariables of queryVariables) {
            this._log(`${network} - Querying ${name} for chainId ${chainVariables.chainId}...`);
            const chainEvents = await (0, queryAllEvents_1.queryAllEvents)(grpcEndpoint, query, dataPath, batchSize, chainVariables);
            await this._processEvents(chainEvents, chainVariables.chainId);
        }
    }
    /**
     * Handles errors with logging and retry delay
     */
    async _handleError(error) {
        const { name, network, errorRetryDelay } = this.config;
        if (network === 'base') {
            console.error(`${network} - Error in ${name} indexer:`, error);
        }
        this._log(`${network} - ${name} indexer error, retrying in ${errorRetryDelay / 1000} seconds...`);
        await this._sleep(errorRetryDelay);
    }
}
exports.IndexerFactory = IndexerFactory;
