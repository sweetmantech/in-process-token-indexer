import { SplitV2Client } from '@0xsplits/splits-sdk';
import type { PublicClient } from 'viem';

interface GetSplitsClientParams {
  chainId: number;
  publicClient: PublicClient;
}

export const getSplitsClient = ({
  chainId,
  publicClient,
}: GetSplitsClientParams): SplitV2Client => {
  return new SplitV2Client({
    chainId,
    publicClient,
  });
};
