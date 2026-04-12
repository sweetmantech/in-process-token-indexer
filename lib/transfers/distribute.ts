import { Transfers_t } from '@/types/envio';
import isSplitContract from '@/lib/splits/isSplitContract';
import { Address, zeroAddress } from 'viem';
import distributeApiCall from './distributeCallApi';
import { getRetryDelay } from '@/lib/getRetryDelay';
import { isRateLimitError } from '@/lib/isRateLimitError';
import { sleep } from '@/lib/sleep';

export async function distribute(transfers: Transfers_t[]) {
  const maxRetries = 3;
  const baseRetryDelay = 1000;
  let totalCnt = 0;
  for (const transfer of transfers) {
    if (!transfer.value || BigInt(transfer.value) <= 0n) continue;

    const recipient = transfer.recipient;
    const isSplit = await isSplitContract(
      recipient as Address,
      transfer.chain_id
    );
    if (isSplit) {
      let lastError: unknown;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const hash = await distributeApiCall({
            splitAddress: recipient as Address,
            tokenAddress: (transfer.currency ?? zeroAddress) as Address,
            chainId: transfer.chain_id,
          });
          console.log(
            `✅ Distribution completed: ${transfer.value} ${transfer.currency} to ${recipient} (tx: ${hash})`
          );
          totalCnt++;
          break;
        } catch (error) {
          lastError = error;
          const isRateLimit = isRateLimitError(error);

          if (attempt < maxRetries) {
            const delay = getRetryDelay(error, attempt, baseRetryDelay);
            const errorType = isRateLimit ? 'rate limit (429)' : 'error';
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            console.warn(
              `⚠️ ${errorType} distributing ${transfer.value} ${transfer.currency} to ${recipient} (attempt ${
                attempt + 1
              }/${maxRetries + 1}), retrying in ${delay}ms...`,
              errorMessage
            );
            await sleep(delay);
            continue;
          }

          const errorType = isRateLimit ? 'rate limit (429)' : 'error';
          console.error(
            `❌ ${errorType} distributing ${transfer.value} ${transfer.currency} to ${recipient} after ${
              maxRetries + 1
            } attempts:`,
            lastError
          );
        }
      }
    }
  }
  if (totalCnt > 0) {
    console.log(`✅ Successfully distributed ${totalCnt} payment(s)`);
  }
}
