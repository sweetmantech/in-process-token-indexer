import { Address } from 'viem';
import { getSplitsClient } from '@/lib/splits/getSplitsClient';
import { EvmSmartAccount } from '@coinbase/cdp-sdk';
import getPublicClient from './getPublicClient';

/**
 * Generates call data to distribute funds from a split contract to its recipients.
 * Uses 0xSplits SDK to generate the distribution call data.
 * Returns a Call object that can be executed via smart wallet.
 */
export async function getSplitCall({
  splitAddress,
  tokenAddress,
  smartAccount,
  chainId,
}: {
  splitAddress: Address;
  tokenAddress: Address;
  smartAccount: EvmSmartAccount;
  chainId: number;
}) {
  const publicClient = getPublicClient(chainId);
  const splitsClient = getSplitsClient({
    chainId,
    publicClient,
  });

  const distributeCallData = await splitsClient.callData.distribute({
    splitAddress,
    tokenAddress,
    distributorAddress: smartAccount.address,
  });

  return {
    to: distributeCallData.address as Address,
    data: distributeCallData.data,
  };
}
