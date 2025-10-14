import processBlocks from "./processBlocks.js";

const CHUNK_SIZE = 250;
const CONCURRENCY_LIMIT = 5;

async function processBlockRange(network, fromBlock, latestBlock) {
  let currentBlock = latestBlock;
  const promises = [];

  while (currentBlock >= fromBlock) {
    const tentativeStart = currentBlock - BigInt(CHUNK_SIZE) + 1n;
    const startBlock = tentativeStart < fromBlock ? fromBlock : tentativeStart;

    // Start processing the current chunk (descending)
    const promise = processBlocks(network, startBlock, currentBlock);
    promises.push(promise);

    currentBlock = startBlock - 1n;

    // If we've reached the concurrency limit, wait for the current batch to finish
    if (promises.length >= CONCURRENCY_LIMIT) {
      await Promise.all(promises);
      promises.length = 0; // Reset the promises array
    }
  }

  // Wait for any remaining promises
  if (promises.length > 0) {
    await Promise.all(promises);
  }
}

export default processBlockRange;
