import { mapMomentsToSupabase } from '../supabase/in_process_tokens/mapMomentsToSupabase.js';
import { upsertTokens } from '../supabase/in_process_tokens/upsertTokens.js';
import { ensureArtists } from '../artists/ensureArtists.js';
import { logForBaseOnly } from '../logForBaseOnly.js';
import { processTokenFeeRecipients } from './processTokenFeeRecipients.js';

const BATCH_SIZE = 100; // Process moments in batches of 100

interface MomentEvent {
  address?: string;
  defaultAdmin?: string;
  chainId: number;
  contractURI?: string;
  blockTimestamp?: string | number;
  payoutRecipient?: string;
  [key: string]: unknown;
}

/**
 * Processes moment events in batches for better performance and memory management
 * @param network - The network name (for logging purposes)
 * @param momentEvents - Array of moment events to process
 */
export async function processMomentsInBatches(
  network: string,
  momentEvents: MomentEvent[]
): Promise<void> {
  let totalProcessed = 0;

  // Since we're now filtering at the query level, we can process all events directly
  const totalBatches = Math.ceil(momentEvents.length / BATCH_SIZE);

  logForBaseOnly(
    network,
    `${network} - Processing ${momentEvents.length} moments in ${totalBatches} batches of ${BATCH_SIZE}`
  );

  for (let i = 0; i < momentEvents.length; i += BATCH_SIZE) {
    const batch = momentEvents.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    try {
      logForBaseOnly(
        network,
        `${network} - Processing batch ${batchNumber}/${totalBatches} (${batch.length} moments)`
      );

      // Map to Supabase format (in_process_tokens format)
      const mappedMoments = mapMomentsToSupabase(batch);

      // Filter out moments without required fields
      const validMoments = mappedMoments.filter(
        moment => moment.address && moment.defaultAdmin && moment.uri
      );

      // Filter out moments which can include 0xSplit -> payout
      if (validMoments.length > 0) {
        const adminAddresses: string[] = validMoments.map(
          moment => moment.defaultAdmin as string
        );
        await ensureArtists(adminAddresses);

        const upsertedTokens = await upsertTokens(validMoments);

        // Process token fee recipients for tokens with split contract payout recipients
        // Convert null to undefined for payoutRecipient to match expected type
        const tokensForFeeRecipients = upsertedTokens.map(token => ({
          ...token,
          payoutRecipient: token.payoutRecipient ?? undefined,
        }));
        await processTokenFeeRecipients(network, tokensForFeeRecipients);

        totalProcessed += validMoments.length;
      } else {
        logForBaseOnly(
          network,
          `${network} - Batch ${batchNumber}: No valid moments found`
        );
      }

      // Add a small delay between batches to prevent overwhelming the database
      if (batchNumber < totalBatches) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logForBaseOnly(
        network,
        `${network} - Batch ${batchNumber}: Error processing batch: ${errorMessage}`
      );
      // Continue with next batch instead of failing completely
    }
  }

  logForBaseOnly(
    network,
    `${network} - Completed processing: ${totalProcessed} moments indexed`
  );
}
