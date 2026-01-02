import { InProcess_Payments_t } from '@/types/envio';
import isSplitContract from '@/lib/splits/isSplitContract';
import { Address } from 'viem';
import distributeApiCall from './distributeCallApi';
import { getRetryDelay } from '@/lib/getRetryDelay';
import { isRateLimitError } from '@/lib/isRateLimitError';
import { sleep } from '@/lib/sleep';

export async function distribute(deposits: InProcess_Payments_t[]) {
  const maxRetries = 3;
  const baseRetryDelay = 1000; // 1 second base delay
  let totalCnt = 0;
  for (const deposit of deposits) {
    const recipient = deposit.recipient;
    const isSplit = await isSplitContract(
      recipient as Address,
      deposit.chain_id
    );
    if (isSplit) {
      let lastError: unknown;
      let success = false;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const hash = await distributeApiCall({
            splitAddress: deposit.recipient as Address,
            tokenAddress: deposit.currency as Address,
            chainId: deposit.chain_id,
          });
          // Transaction sent successfully - distribution completed for this deposit
          console.log(
            `✅ Distribution completed: ${deposit.amount} ${deposit.currency} to ${recipient} (tx: ${hash})`
          );
          totalCnt++;
          success = true;
          break;
        } catch (error) {
          lastError = error;
          const isRateLimit = isRateLimitError(error);

          // If this is not the last attempt, wait and retry
          if (attempt < maxRetries) {
            const delay = getRetryDelay(error, attempt, baseRetryDelay);
            const errorType = isRateLimit ? 'rate limit (429)' : 'error';
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            console.warn(
              `⚠️ ${errorType} distributing ${deposit.amount} ${deposit.currency} to ${recipient} (attempt ${
                attempt + 1
              }/${maxRetries + 1}), retrying in ${delay}ms...`,
              errorMessage
            );
            await sleep(delay);
            continue;
          }

          // Last attempt failed, log error
          const errorType = isRateLimit ? 'rate limit (429)' : 'error';
          console.error(
            `❌ ${errorType} distributing ${deposit.amount} ${deposit.currency} to ${recipient} after ${
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
