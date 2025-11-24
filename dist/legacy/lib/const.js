import dotenv from 'dotenv';
import { baseSepolia, base } from 'viem/chains';
dotenv.config();
export const BASE_SEPOLIA_FIRST_BLOCK = BigInt(process.env.BASE_SEPOLIA_FIRST_BLOCK || '0');
export const BASE_FIRST_BLOCK = BigInt(process.env.BASE_FIRST_BLOCK || '0');
export const COINBASE_RPC_KEY = process.env.COINBASE_RPC_KEY;
export const GRPC_ENDPOINT = 'https://indexer.dev.hyperindex.xyz/802bf29/v1/graphql';
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const networks = [base, baseSepolia];
//# sourceMappingURL=const.js.map