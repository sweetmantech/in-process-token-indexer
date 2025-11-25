import { createPublicClient, http, type PublicClient } from 'viem';
import { getChain } from './getChain.js';

const getPublicClient = (chainId: number): PublicClient =>
  createPublicClient({
    chain: getChain(chainId),
    transport: http(),
  });

export default getPublicClient;
