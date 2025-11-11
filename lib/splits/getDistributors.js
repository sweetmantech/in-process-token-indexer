import getPublicClient from '../viem/getPublicClient.js';
import { getSplitsClient } from './getSplitsClient.js';

/**
 * Gets the recipient addresses (distributors) from a split contract address.
 * Uses the 0xSplits SDK to fetch split metadata which includes recipients.
 */
export const getDistributors = async (splitAddress, chainId) => {
  const publicClient = getPublicClient(chainId);
  const splitsClient = getSplitsClient({
    chainId,
    publicClient,
  });

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
      return metadata.split.recipients.map(item => ({
        address: item.recipient.address,
        percentAllocation: item.percentAllocation,
      }));
    }

    return null;
  } catch (error) {
    console.error('Error getting split recipients from address:', error);
    return null;
  }
};
