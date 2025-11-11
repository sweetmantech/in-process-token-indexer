import getPublicClient from './getPublicClient.js';
import { erc20MinterAddresses } from '../const.js';
import {
  erc20MinterABI,
  erc20MinterAddress,
  zoraCreatorFixedPriceSaleStrategyABI,
  zoraCreatorFixedPriceSaleStrategyAddress,
} from '@zoralabs/protocol-deployments';
import { base, baseSepolia } from 'viem/chains';

// Mint type constants
const MintType = {
  ZoraErc20Mint: 'ZoraErc20Mint',
  ZoraFixedPriceMint: 'ZoraFixedPriceMint',
};

/**
 * Gets sale configuration for a token contract
 * @param {string} tokenContract - The token contract address
 * @param {number|bigint} tokenId - The token ID
 * @param {string} network - The network name ('base' or 'baseSepolia')
 * @returns {Promise<Object>} - The sale configuration
 */
const getSale = async (tokenContract, tokenId, network = 'base') => {
  const publicClient = getPublicClient(network);
  const chainId = network === 'base' ? base.id : baseSepolia.id;

  // Use addresses from protocol-deployments package, fallback to const.js if needed
  const erc20MinterAddr =
    erc20MinterAddress[chainId] || erc20MinterAddresses[chainId];
  const fixedPriceSaleAddr = zoraCreatorFixedPriceSaleStrategyAddress[chainId];

  if (!erc20MinterAddr || !fixedPriceSaleAddr) {
    throw new Error(`No sale strategy addresses found for chainId ${chainId}`);
  }

  const erc20SaleConfigCall = {
    address: erc20MinterAddr,
    abi: erc20MinterABI,
    functionName: 'sale',
    args: [tokenContract, tokenId],
  };
  const fixedSaleConfigCall = {
    address: fixedPriceSaleAddr,
    abi: zoraCreatorFixedPriceSaleStrategyABI,
    functionName: 'sale',
    args: [tokenContract, tokenId],
  };

  const infoCalls = await publicClient.multicall({
    contracts: [erc20SaleConfigCall, fixedSaleConfigCall],
  });

  const saleConfig =
    infoCalls[0]?.result?.saleEnd > BigInt(0)
      ? {
          ...infoCalls[0]?.result,
          type: MintType.ZoraErc20Mint,
        }
      : {
          ...infoCalls[1]?.result,
          type: MintType.ZoraFixedPriceMint,
        };

  return saleConfig;
};

export default getSale;
