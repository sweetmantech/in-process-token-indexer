import { getSplitsClient } from "./getSplitsClient.js";
import getPublicClient from "../viem/getPublicClient.js";

/**
 * Checks if an address is a split contract by attempting to read split metadata.
 * Returns true if the address is a valid split contract, false otherwise.
 */
export const isSplitContract = async (
  address,
  chainId
) => {
  try {
    const publicClient = getPublicClient(chainId);
    const splitsClient = getSplitsClient({
      chainId,
      publicClient,
    });

    // Try to get split metadata - if it succeeds, it's a split contract
    await splitsClient.getSplitMetadataViaProvider({
      splitAddress: address,
      chainId,
    });

    return true;
  } catch {
    // If getting metadata fails, it's not a split contract
    return false;
  }
};
