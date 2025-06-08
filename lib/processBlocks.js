import getLogs from "./getLogs.js";
import decodeEventLog from "./viem/decodeEventLog.js";
import { upsertTokens } from "./supabase/upsertTokens.js";
import getPublicClient from "./viem/getPublicClient.js";

const BATCH_SIZE = 99; // Adjust this value as needed

async function processBlocks(network, start, end) {
  const events = await getLogs(network, start, end);
  console.log(`${network} - Processing ${events.length} events`);
  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);
    const decodedLogs = batch.map((event) => decodeEventLog(event));
    console.log("DECODED LOGS", decodedLogs);
    const publicClient = getPublicClient(network);
    const block = await publicClient.getBlock({
      blockNumber: decodedLogs[0].blockNumber,
    });
    const supabaseUpsertData = decodedLogs.map((log) => ({
      address: log.args.newContract,
      defaultAdmin: log.args.creator,
      chainId: network === "base" ? 8453 : 84532,
      tokenId: 0,
      uri: log.args.contractURI,
      createdAt: new Date(Number(block.timestamp) * 1000).toISOString(),
    }));
    await upsertTokens(supabaseUpsertData);
    // TODO: Implement event processing logic here (e.g., write to DB)
    console.log(`${network} - Would process batch of ${batch.length} events`);
  }
}

export default processBlocks;
