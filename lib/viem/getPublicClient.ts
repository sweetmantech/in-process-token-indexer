import { createPublicClient, http, type PublicClient } from 'viem';
import { getChainById } from './getChainById';

const getPublicClient = (chainId: number): PublicClient =>
  createPublicClient({
    chain: getChainById(chainId),
    transport: http(),
  });

export default getPublicClient;
