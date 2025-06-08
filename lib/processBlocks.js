import getLogs from "./getLogs.js";
import decodeEventLog from "./viem/decodeEventLog.js";
import { upsertTokens } from "./supabase/in_proces_tokens/upsertTokens.js";
import { mapLogsToSupabase } from "./supabase/in_proces_tokens/mapLogsToSupabase.js";
import { getBlock } from "./viem/getBlock.js";

const BATCH_SIZE = 99; // Adjust this value as needed

async function processBlocks(network, start, end) {
  const events = await getLogs(network, start, end);
  console.log(`${network} - Processing ${events.length} events`);

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);
    const decodedLogs = batch.map((event) => decodeEventLog(event));
    console.log("DECODED LOGS", decodedLogs);
    const block = await getBlock(network, decodedLogs[0].blockNumber);
    const supabaseUpsertData = mapLogsToSupabase(decodedLogs, block, network);
    await upsertTokens(supabaseUpsertData);
    console.log(`${network} - Would process batch of ${batch.length} events`);
  }
}

export default processBlocks;
