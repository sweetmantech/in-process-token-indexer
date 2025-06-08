# In Process Indexer

This is a Node.js-based indexer for In Process protocol SetupNewToken events on Base and Base Sepolia networks, designed to help developers building applications on In Process.

## Benefits for Developers

This indexer provides several advantages for developers building applications on In Process:

1. **Real-time Event Tracking**: Automatically indexes and tracks In Process protocol SetupNewToken events on Base.
2. **Customizable**: Can be easily modified to focus on specific EVM events or contracts of interest.
3. **Network Flexibility**: Supports both Base mainnet and Base Sepolia testnet.
4. **Efficient Data Processing**: Uses chunked requests and multiple RPC endpoints for reliable data fetching.
5. **Easy Integration**: Simplifies the process of accessing historical and real-time In Process token data.

By using this indexer, developers can focus on building their In Process applications without worrying about the complexities of event indexing and data management.

## Prerequisites

- Node.js (version 14 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/SweetmanTech/in-process-token-indexer
   cd in-process-token-indexer
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up your environment variables:
   Copy the `.env.example` file to `.env` in the root directory and add any necessary environment variables.

## Usage

To run the indexer:

1. Start the indexer:

   ```
   npm start
   ```

2. The indexer will start processing reward events from the specified network (Base or Base Sepolia).

3. To switch between networks or customize the indexing process, you can modify the following environment variables in your `.env` file:

   - `NETWORK`: Set to either `mainnet` for Base or `sepolia` for Base Sepolia
   - `START_BLOCK`: The block number to start indexing from (optional)
   - `END_BLOCK`: The block number to end indexing at (optional)

4. Monitor the console output for indexing progress and any potential errors.

5. The indexed data will be stored according to the implementation in `indexEventsForNetwork.js`.

## Event Indexed

This indexer specifically tracks the `SetupNewContract` event from the Zora Creator 1155 Factory contract. This event is emitted when a new contract is set up.

## Customization

- To index different events or contracts, modify the `getEventSignature.js` file in the `lib/viem` directory to change the event being tracked.
- Adjust RPC endpoints in `lib/rpc.js` if needed.
- To modify how event data is processed or stored, update the event processing logic in `processBlocks.js`.

## Troubleshooting

If you encounter any issues during deployment:

1. Check the GitHub Actions logs for any error messages.
2. Ensure all secrets are correctly set in your GitHub repository.
3. Verify that your Droplet has sufficient resources (CPU, RAM, disk space).
4. Check the PM2 logs on your Droplet: `pm2 logs myco-rewards-indexer`

For more detailed logs, you can modify the logging level in the indexer code.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
