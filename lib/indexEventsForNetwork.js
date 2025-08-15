import getBlockNumber from "./getBlockNumber.js";
import getFromBlock from "./getFromBlock.js";
import processBlockRange from "./processBlockRange.js";
import { logForBaseOnly } from "./logForBaseOnly.js";

async function indexEventsForNetwork(network) {
  logForBaseOnly(network, `Starting indexer for ${network}...`);
  let fromBlock = BigInt(getFromBlock(network));
  let latestProcessedBlock = fromBlock - 1n;

  while (true) {
    try {
      const latestBlock = await getBlockNumber(network);
      fromBlock = latestProcessedBlock + 1n;
      if (fromBlock <= latestBlock) {
        logForBaseOnly(
          network,
          `${network} - Polling: processing new blocks from ${fromBlock} to ${latestBlock}`
        );
        await processBlockRange(network, fromBlock, latestBlock);
        latestProcessedBlock = latestBlock;
      }
      // Poll every 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      if (network === "base") {
        console.error(`${network} - Error in indexEvents:`, error);
      }
      logForBaseOnly(network, `${network} - Retrying in 1 minute...`);
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }
}

export default indexEventsForNetwork;
