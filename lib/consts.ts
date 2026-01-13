import dotenv from 'dotenv';
import { base, baseSepolia } from 'viem/chains';

dotenv.config();

export const INDEXER_ID = '2f876b2';
export const GRPC_ENDPOINT = `https://indexer.dev.hyperindex.xyz/${INDEXER_ID}/v1/graphql`;

export const SUPABASE_URL: string | undefined = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY: string | undefined =
  process.env.SUPABASE_SERVICE_ROLE_KEY;
export const CDP_API_KEY_ID = process.env.CDP_API_KEY_ID!;
export const CDP_API_KEY_SECRET = process.env.CDP_API_KEY_SECRET!;
export const CDP_WALLET_SECRET = process.env.CDP_WALLET_SECRET!;
export const CDP_PAYMASTER_KEY = process.env.CDP_PAYMASTER_KEY!;

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
