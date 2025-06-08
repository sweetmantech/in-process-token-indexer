import getBlockNumber from "./getBlockNumber.js";
import getFromBlock from "./getFromBlock.js";
import processBlockRange from "./processBlockRange.js";

async function indexEventsForNetwork(network) {
  console.log(`Starting indexer for ${network}...`);
  let fromBlock = BigInt(getFromBlock(network));
  let latestProcessedBlock = fromBlock - 1n;

  while (true) {
    try {
      const latestBlock = await getBlockNumber(network);
      fromBlock = latestProcessedBlock + 1n;
      if (fromBlock <= latestBlock) {
        console.log(
          `${network} - Polling: processing new blocks from ${fromBlock} to ${latestBlock}`
        );
        await processBlockRange(network, fromBlock, latestBlock);
        latestProcessedBlock = latestBlock;
      }
      // Poll every 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`${network} - Error in indexEvents:`, error);
      console.log(`${network} - Retrying in 1 minute...`);
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }
}

export default indexEventsForNetwork;
