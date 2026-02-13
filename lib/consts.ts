import dotenv from 'dotenv';
import { base, baseSepolia } from 'viem/chains';

dotenv.config();

export const INDEXER_ID = '6646a7a';
export const GRPC_ENDPOINT = `https://indexer.dev.hyperindex.xyz/${INDEXER_ID}/v1/graphql`;

export const SUPABASE_URL: string | undefined = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY: string | undefined =
  process.env.SUPABASE_SERVICE_ROLE_KEY;
export const CDP_API_KEY_ID = process.env.CDP_API_KEY_ID!;
export const CDP_API_KEY_SECRET = process.env.CDP_API_KEY_SECRET!;
export const CDP_WALLET_SECRET = process.env.CDP_WALLET_SECRET!;
export const CDP_PAYMASTER_KEY = process.env.CDP_PAYMASTER_KEY!;

export const TELEGRAM_BOT_API_KEY = process.env.TELEGRAM_BOT_API_KEY;
export const ARWEAVE_KEY = JSON.parse(
  Buffer.from(process.env.ARWEAVE_KEY as string, 'base64').toString()
);
export const REFERRAL_RECIPIENT = '0x749B7b7A6944d72266Be9500FC8C221B6A7554Ce';
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const IN_PROCESS_API = process.env.IN_PROCESS_API;

export const NETWORKS = [
  {
    id: base.id,
    name: base.name,
  },
  {
    id: baseSepolia.id,
    name: baseSepolia.name,
  },
];

export const INDEX_INTERVAL_MS = 1000;
export const INDEX_INTERVAL_EMPTY_MS = 1500;
export const BATCH_SIZE = 100;
export const PAGE_LIMIT = 1000;
