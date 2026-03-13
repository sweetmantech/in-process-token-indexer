import { mapPaymentsToSupabase } from './mapPaymentsToSupabase';
import { upsertPayments } from '@/lib/supabase/in_process_payments/upsertPayments';
import { ensureArtists } from '@/lib/supabase/in_process_artists/ensureArtists';
import type { Payments_t } from '@/types/envio';
import { BATCH_SIZE } from '../consts';
import { distribute } from './distribute';

/**
 * Processes payment deposits in batches for better performance and memory management.
 * @param deposits - Array of Payments_t to process.
 * @returns Promise that resolves when all batches are processed.
 */
export async function processPaymentsInBatches(
  deposits: Payments_t[]
): Promise<void> {
  if (deposits.length === 0) {
    console.log('ℹ️  No payments to process');
    return;
  }

  const totalBatches = Math.ceil(deposits.length / BATCH_SIZE);
  let totalProcessed = 0;

  console.log(
    `🔄 Processing ${deposits.length} payment(s) in ${totalBatches} batch(es) of ${BATCH_SIZE}`
  );

  for (let i = 0; i < deposits.length; i += BATCH_SIZE) {
    const batch = deposits.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    try {
      console.log(
        `🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} payment(s))`
      );

      // await distribute(batch);
      const mappedPayments = await mapPaymentsToSupabase(batch);

      if (mappedPayments.length > 0) {
        const buyerAddresses = mappedPayments.map(
          mappedPayments => mappedPayments.buyer as string
        );
        await ensureArtists(buyerAddresses);

        await upsertPayments(mappedPayments);

        totalProcessed += mappedPayments.length;
        console.log(
          `✅ Batch ${batchNumber}: Successfully processed ${mappedPayments.length} payment(s)`
        );
      } else {
        console.log(
          `⚠️  Batch ${batchNumber}: No valid payments found (filtered out ${mappedPayments.length - mappedPayments.length})`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `❌ Batch ${batchNumber}: Error processing batch: ${errorMessage}`
      );
      throw error;
    }
  }

  console.log(
    `✅ Completed processing: ${totalProcessed}/${deposits.length} payment(s) indexed`
  );
}
