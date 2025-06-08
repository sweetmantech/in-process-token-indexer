import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";

const getPublicClient = (network) =>
  createPublicClient({
    chain: network === "base" ? base : baseSepolia,
    transport: http(),
  });

export default getPublicClient;
