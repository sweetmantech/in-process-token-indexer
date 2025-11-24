import { supabase } from '../client';

export interface TokenData {
  address: string;
  defaultAdmin: string;
  chainId: number;
  tokenId: number;
  uri?: string;
  createdAt: string;
  payoutRecipient?: string;
  [key: string]: unknown;
}

export interface UpsertedToken {
  id: string;
  address: string;
  defaultAdmin: string;
  chainId: number;
  tokenId: number;
  uri?: string;
  createdAt: string;
  payoutRecipient?: string | null;
  hidden?: boolean;
  [key: string]: unknown;
}

/**
 * Upserts multiple token records into the in_process_tokens table.
 * @param tokens - Array of token data objects to upsert.
 * @returns The upserted records or error.
 */
export async function upsertTokens(
  tokens: TokenData[]
): Promise<UpsertedToken[]> {
  // Remove duplicates based on conflict columns (address and chainId)
  const uniqueTokens = tokens.filter(
    (token, index, self) =>
      index ===
      self.findIndex(
        t => t.address === token.address && t.chainId === token.chainId
      )
  );

  // Log deduplication info if there were duplicates
  if (uniqueTokens.length < tokens.length) {
    console.log(
      `Deduplicated tokens: ${tokens.length} -> ${
        uniqueTokens.length
      } (removed ${tokens.length - uniqueTokens.length} duplicates)`
    );
  }

  const { data, error } = await supabase
    .from('in_process_tokens')
    .upsert(uniqueTokens, { onConflict: 'address, chainId' })
    .select();

  if (error) {
    throw error;
  }
  return data || [];
}
