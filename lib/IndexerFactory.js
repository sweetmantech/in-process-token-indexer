import { logForBaseOnly } from './logForBaseOnly.js';
import { queryAllEvents } from './grpc/queryAllEvents.js';

/**
 * Factory class for creating indexers with common functionality
 * Abstracts the polling, error handling, and logging patterns used by both payments and moments indexers
 */
export class IndexerFactory {
  constructor(config) {
    this.config = {
      name: config.name, // e.g., "payments", "moments"
      network: config.network || 'base',
      grpcEndpoint: config.grpcEndpoint,
      batchSize: config.batchSize || 1000,
      pollInterval: config.pollInterval || 30000, // 30 seconds
      errorRetryDelay: config.errorRetryDelay || 60000, // 1 minute
      query: config.query, // The GraphQL query string
      dataPath: config.dataPath, // The path to extract events from the response
      processFunction: config.processFunction, // Function to process events
      getQueryVariables: config.getQueryVariables, // Function to get dynamic query variables
      ...config,
    };
  }

  /**
   * Utility method to create consistent log messages
   */
  _log(message) {
    const { network } = this.config;
    logForBaseOnly(network, message);
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
    const { name, network, processFunction } = this.config;

    if (events.length > 0) {
      const chainText = chainId ? ` for chainId ${chainId}` : '';
      const totalText = chainId ? ' total' : '';
      this._log(
        `${network} - Found ${events.length}${totalText} ${name} events${chainText}`
      );
      await processFunction(network, events);
    } else {
      this._log(`${network} - No new ${name} events found`);
    }
  }

  /**
   * Starts the indexer with polling loop
   */
  async start() {
    const { name, network } = this.config;
    this._log(`Starting ${name} indexer for ${network}...`);

    while (true) {
      try {
        await this._pollForEvents();
      } catch (error) {
        await this._handleError(error);
      }
    }
  }

  /**
   * Polls for new events and processes them
   */
  async _pollForEvents() {
    const { name, network, pollInterval, getQueryVariables } = this.config;

    this._log(`${network} - Querying ${name} from GRPC endpoint...`);

    // Get dynamic query variables if provided
    const queryVariables = getQueryVariables ? await getQueryVariables() : {};

    // Handle both single query variables and array of query variables (for multiple chains)
    if (Array.isArray(queryVariables)) {
      await this._processMultipleChains(queryVariables);
    } else {
      await this._processSingleQuery(queryVariables);
    }

    // Poll at specified interval
    await this._sleep(pollInterval);
  }

  /**
   * Processes events for multiple chains
   */
  async _processMultipleChains(queryVariables) {
    const { name, network, grpcEndpoint, batchSize, query, dataPath } =
      this.config;

    for (const chainVariables of queryVariables) {
      this._log(
        `${network} - Querying ${name} for chainId ${chainVariables.chainId}...`
      );

      const chainEvents = await queryAllEvents(
        grpcEndpoint,
        query,
        dataPath,
        batchSize,
        chainVariables
      );
      await this._processEvents(chainEvents, chainVariables.chainId);
    }
  }

  /**
   * Processes events for a single query
   */
  async _processSingleQuery(queryVariables) {
    const { grpcEndpoint, batchSize, query, dataPath } = this.config;

    const events = await queryAllEvents(
      grpcEndpoint,
      query,
      dataPath,
      batchSize,
      queryVariables
    );
    await this._processEvents(events);
  }

  /**
   * Handles errors with logging and retry delay
   */
  async _handleError(error) {
    const { name, network, errorRetryDelay } = this.config;

    if (network === 'base') {
      console.error(`${network} - Error in ${name} indexer:`, error);
    }

    this._log(
      `${network} - ${name} indexer error, retrying in ${errorRetryDelay / 1000} seconds...`
    );
    await this._sleep(errorRetryDelay);
  }
}
