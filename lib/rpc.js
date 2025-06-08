import { COINBASE_RPC_KEY } from "./const.js";

export const NETWORKS = {
  BASE_MAINNET: "base",
  BASE_TESTNET: "baseSepolia",
};

export const RPC_URLS = {
  [NETWORKS.BASE_MAINNET]: {
    http: [
      `https://api.developer.coinbase.com/rpc/v1/base/${COINBASE_RPC_KEY}`,
      "https://mainnet.base.org",
      "https://base.llamarpc.com",
      "https://base.blockpi.network/v1/rpc/public",
      "https://developer-access-mainnet.base.org",
      "https://base-rpc.publicnode.com",
    ],
  },
  [NETWORKS.BASE_TESTNET]: {
    http: [
      `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${COINBASE_RPC_KEY}`,
      "https://sepolia.base.org",
      "https://base-sepolia-rpc.publicnode.com",
      "https://base-sepolia.blockpi.network/v1/rpc/public",
    ],
  },
};
