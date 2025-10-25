import dotenv from "dotenv";

dotenv.config();

export const BASE_SEPOLIA_FIRST_BLOCK = BigInt(
  process.env.BASE_SEPOLIA_FIRST_BLOCK || "0"
);
export const BASE_FIRST_BLOCK = BigInt(process.env.BASE_FIRST_BLOCK || "0");
export const COINBASE_RPC_KEY = process.env.COINBASE_RPC_KEY;
export const PAYMENTS_GRPC_ENDPOINT =
  "https://indexer.dev.hyperindex.xyz/9155af6/v1/graphql";
export const MOMENTS_GRPC_ENDPOINT =
  "https://indexer.dev.hyperindex.xyz/05f4e0d/v1/graphql";

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;