import rpcRequest from "./rpcRequest.js";
import getEventSignature from "./viem/getEventSignature.js";
import getTransactionDetails from "./viem/getTransactionDetails.js";
import { logForBaseOnly } from "./logForBaseOnly.js";
import { ENTRY_POINT, SMART_WALLET_SEND_OPERATION_EVENT } from "./const.js";

async function getLogs(network, fromBlock, toBlock) {
  const CHUNK_SIZE = 1000n;
  let allLogs = [];

  for (
    let chunkStart = fromBlock;
    chunkStart <= toBlock;
    chunkStart += CHUNK_SIZE
  ) {
    const chunkEnd =
      chunkStart + CHUNK_SIZE - 1n > toBlock
        ? toBlock
        : chunkStart + CHUNK_SIZE - 1n;
    logForBaseOnly(
      network,
      `${network} - Fetching logs for blocks ${chunkStart} to ${chunkEnd}`
    );

    const blockRange = {
      fromBlock: `0x${chunkStart.toString(16)}`,
      toBlock: `0x${chunkEnd.toString(16)}`,
    }
    const factoryLogs = await rpcRequest(network, "eth_getLogs", [
      {
        topics: [getEventSignature()],
        address:
          network === "base"
            ? "0x540C18B7f99b3b599c6FeB99964498931c211858"
            : "0x6832A997D8616707C7b68721D6E9332E77da7F6C",
        ...blockRange
      },
    ]);

    const entryLogs = await rpcRequest(network, "eth_getLogs", [
      {
        topics: [SMART_WALLET_SEND_OPERATION_EVENT],
        address: ENTRY_POINT,
        ...blockRange
      },
    ]);

    const combinedLogs = [...(factoryLogs || []), ...(entryLogs || [])]
    const logPromises = combinedLogs.map((log) =>
      getTransactionDetails(network, log.transactionHash).then((allTxLogs) => ({
        matchedLog: log,
        allTxLogs: allTxLogs,
      }))
    );

    allLogs.push(...(await Promise.all(logPromises)));
  }

  return allLogs;
}

export default getLogs;
