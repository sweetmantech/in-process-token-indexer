import { logForBaseOnly } from "./logForBaseOnly.js";
import { queryAllEvents } from "./grpc/queryAllEvents.js";

/**
 * Factory class for creating indexers with common functionality
 * Abstracts the polling, error handling, and logging patterns used by both payments and moments indexers
 */
export class IndexerFactory {
  constructor(config) {
    this.config = {
      name: config.name, // e.g., "payments", "moments"
      network: config.network || "base",
      grpcEndpoint: config.grpcEndpoint,
      batchSize: config.batchSize || 1000,
      pollInterval: config.pollInterval || 30000, // 30 seconds
      errorRetryDelay: config.errorRetryDelay || 60000, // 1 minute
      query: config.query, // The GraphQL query string
      dataPath: config.dataPath, // The path to extract events from the response
      processFunction: config.processFunction, // Function to process events
      ...config
    };
  }

  /**
   * Starts the indexer with polling loop
   */
  async start() {
    const { name, network } = this.config;
    logForBaseOnly(network, `Starting ${name} indexer for ${network}...`);

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
    const { name, network, grpcEndpoint, batchSize, pollInterval, query, dataPath, processFunction } = this.config;
    
    logForBaseOnly(
      network,
      `${network} - Querying ${name} from GRPC endpoint...`
    );

    // Query events from GRPC endpoint with pagination using the generic queryAllEvents function
    const events = await queryAllEvents(grpcEndpoint, query, dataPath, batchSize);

    if (events.length > 0) {
      logForBaseOnly(
        network,
        `${network} - Found ${events.length} ${name} events`
      );

      // Process events in batches for better performance
      await processFunction(network, events);
    } else {
      logForBaseOnly(network, `${network} - No new ${name} events found`);
    }

    // Poll at specified interval
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  /**
   * Handles errors with logging and retry delay
   */
  async _handleError(error) {
    const { name, network, errorRetryDelay } = this.config;
    
    if (network === "base") {
      console.error(`${network} - Error in ${name} indexer:`, error);
    }
    
    logForBaseOnly(
      network,
      `${network} - ${name} indexer error, retrying in ${errorRetryDelay / 1000} seconds...`
    );
    
    await new Promise((resolve) => setTimeout(resolve, errorRetryDelay));
  }
}