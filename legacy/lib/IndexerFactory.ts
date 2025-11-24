import { logForBaseOnly } from './logForBaseOnly';
import { queryAllEvents } from './grpc/queryAllEvents';
import { getNetwork } from './viem/getNetwork';

interface QueryVariables {
  chainId: number;
  [key: string]: unknown;
}

interface IndexerConfig {
  name: string; // e.g., "payments", "moments"
  network?: string;
  grpcEndpoint: string;
  batchSize?: number;
  pollInterval?: number; // in milliseconds
  errorRetryDelay?: number; // in milliseconds
  query: string; // The GraphQL query string
  dataPath: string; // The path to extract events from the response
  processFunction: (network: string, events: unknown[]) => Promise<void>; // Function to process events
  getQueryVariables?: () => Promise<QueryVariables[]>; // Function to get dynamic query variables
}

/**
 * Factory class for creating indexers with common functionality
 * Abstracts the polling, error handling, and logging patterns used by both payments and moments indexers
 */
export class IndexerFactory {
  private config: Required<IndexerConfig>;

  constructor(config: IndexerConfig) {
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
  private _log(message: string): void {
    const { network } = this.config;
    logForBaseOnly(network, message);
  }

  /**
   * Utility method for sleep/delay functionality
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Processes events and logs the results consistently
   */
  private async _processEvents(
    events: unknown[],
    chainId: number | null = null
  ): Promise<void> {
    const { name, processFunction } = this.config;

    const network = getNetwork(chainId);

    this._log(`${network} - Querying ${name} from GRPC endpoint...`);
    this._log(`Starting ${name} indexer for ${network}...`);

    if (events.length > 0) {
      const chainText = chainId ? ` for chainId ${chainId}` : '';
      const totalText = chainId ? ' total' : '';
      this._log(
        `${network} - Found ${events.length}${totalText} ${name} events${chainText}`
      );
      await processFunction(getNetwork(chainId), events);
    } else {
      this._log(`${network} - No new ${name} events found`);
    }
  }

  /**
   * Starts the indexer with polling loop
   */
  async start(): Promise<never> {
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
  private async _pollForEvents(): Promise<void> {
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
  private async _processMultipleChains(
    queryVariables: QueryVariables[]
  ): Promise<void> {
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
   * Handles errors with logging and retry delay
   */
  private async _handleError(error: unknown): Promise<void> {
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
