import getLogs from "./getLogs.js";
import decodeEventLog from "./viem/decodeEventLog.js";
import { upsertTokens } from "./supabase/in_process_tokens/upsertTokens.js";
import { mapLogsToSupabase } from "./supabase/in_process_tokens/mapLogsToSupabase.js";
import { getBlock } from "./viem/getBlock.js";
import updateProfiles from "./profile/updateProfiles.js";
import { logForBaseOnly } from "./logForBaseOnly.js";

const BATCH_SIZE = 99; // Adjust this value as needed

async function processBlocks(network, start, end) {
  const events = await getLogs(network, start, end);
  logForBaseOnly(network, `${network} - Processing ${events.length} events`);

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);
    const decodedLogs = batch.map((event) => decodeEventLog(event));
    const filteredLogs = decodedLogs.filter((log) => Boolean(log));

    if (filteredLogs[0]) {
      logForBaseOnly(network, "DECODED LOGS", filteredLogs);
      const block = await getBlock(network, filteredLogs[0].blockNumber);
      const supabaseUpsertData = mapLogsToSupabase(filteredLogs, block, network);

      // Create artists first to avoid foreign key constraint violations
      await updateProfiles(filteredLogs);
      // Then insert tokens that reference the artists
      await upsertTokens(supabaseUpsertData);
    }

    logForBaseOnly(
      network,
      `${network} - Would process batch of ${batch.length} events`
    );
  }
}

export default processBlocks;
