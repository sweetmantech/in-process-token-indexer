import getPublicClient from '../viem/getPublicClient.js';
import { getSplitsClient } from './getSplitsClient.js';
import { isRateLimitError } from '../utils/isRateLimitError.js';
import { getRetryDelay } from '../utils/getRetryDelay.js';

interface SplitRecipient {
  address: string;
  percentAllocation: string;
}

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Gets the recipient addresses (recipients) from a split contract address.
 * Uses the 0xSplits SDK to fetch split metadata which includes recipients.
 * @param splitAddress - The split contract address
 * @param chainId - The chain ID
 * @param options - Retry options
 * @param options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param options.retryDelay - Initial retry delay in milliseconds (default: 100)
 * @returns Array of recipients or null if failed/not a split
 */
export const getSplitRecipients = async (
  splitAddress: `0x${string}`,
  chainId: number,
  options: RetryOptions = {}
): Promise<SplitRecipient[] | null> => {
  const { maxRetries = 3, retryDelay = 100 } = options;
  const publicClient = getPublicClient(chainId);
  const splitsClient = getSplitsClient({
    chainId,
    publicClient,
  });

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const metadata = await splitsClient.getSplitMetadataViaProvider({
        splitAddress,
        chainId,
      });

      // The metadata contains a split object with recipients
      if (
        metadata.split?.recipients &&
        Array.isArray(metadata.split.recipients)
      ) {
        return metadata.split.recipients.map(
          (item: {
            recipient: { address: string };
            percentAllocation: number;
          }) => ({
            address: item.recipient.address,
            percentAllocation: String(item.percentAllocation),
          })
        );
      }

      return null;
    } catch (error) {
      lastError = error;
      const isRateLimit = isRateLimitError(error);

      // If this is not the last attempt, wait and retry
      if (attempt < maxRetries) {
        const delay = getRetryDelay(error, attempt, retryDelay);
        const errorType = isRateLimit ? 'rate limit (429)' : 'error';
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.warn(
          `${errorType} getting split recipients from address ${splitAddress} (attempt ${
            attempt + 1
          }/${maxRetries + 1}), retrying in ${delay}ms...`,
          errorMessage
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Last attempt failed, log error and return null
      const errorType = isRateLimit ? 'rate limit (429)' : 'error';
      console.error(
        `${errorType} getting split recipients from address ${splitAddress} after ${
          maxRetries + 1
        } attempts:`,
        error
      );
      return null;
    }
  }

  // Fallback (shouldn't reach here, but TypeScript/ESLint might complain)
  console.error(
    `Failed to get split recipients from address ${splitAddress} after all retries:`,
    lastError
  );
  return null;
};
