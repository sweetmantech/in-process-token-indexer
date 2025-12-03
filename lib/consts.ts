import dotenv from 'dotenv';
import { base, baseSepolia } from 'viem/chains';

dotenv.config();

export const INDEXER_ID = 'ba42576';
export const GRPC_ENDPOINT = `https://indexer.dev.hyperindex.xyz/${INDEXER_ID}/v1/graphql`;

export const SUPABASE_URL: string | undefined = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY: string | undefined =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

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
