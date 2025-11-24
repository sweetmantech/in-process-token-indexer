import { logForBaseOnly } from '../logForBaseOnly.js';
import { ensureArtists } from '../artists/ensureArtists.js';
import { getSplitRecipients } from '../splits/getSplitRecipients.js';
import isSplitContract from '../splits/isSplitContract.js';
import { upsertTokenFeeRecipients } from '../supabase/in_process_token_fee_recipients/upsertTokenFeeRecipients.js';
import type { TokenFeeRecipientData } from '../supabase/in_process_token_fee_recipients/upsertTokenFeeRecipients.js';

interface TokenWithRecipient {
  id: string;
  payoutRecipient?: string;
  chainId: number;
  [key: string]: unknown;
}

/**
 * Processes token fee recipients for tokens with payout recipients (split or non-split).
 * @param network - The network name (for logging purposes)
 * @param upsertedTokens - Tokens returned from upsertTokens, including payoutRecipient and chainId.
 */
export async function processTokenFeeRecipients(
  network: string,
  upsertedTokens: TokenWithRecipient[]
): Promise<void> {
  const recipientsInserts: TokenFeeRecipientData[] = [];
  const recipientAddresses: string[] = [];
  const tokensWithSplitRecipients = upsertedTokens.filter(
    token => token.payoutRecipient
  );
  for (const token of tokensWithSplitRecipients) {
    try {
      const isSplit = await isSplitContract(
        token.payoutRecipient as `0x${string}`,
        token.chainId
      );
      if (isSplit) {
        const recipients = await getSplitRecipients(
          token.payoutRecipient as `0x${string}`,
          token.chainId
        );
        if (recipients && recipients.length > 0) {
          for (const recipient of recipients) {
            const address = recipient.address.toLowerCase();
            recipientsInserts.push({
              token: token.id,
              artist_address: address,
              percentAllocation: parseFloat(recipient.percentAllocation),
            });
            recipientAddresses.push(address);
          }
        }
      } else {
        if (!token.payoutRecipient) continue;
        const address = token.payoutRecipient.toLowerCase();
        recipientsInserts.push({
          token: token.id,
          artist_address: address,
          percentAllocation: 100,
        });
        recipientAddresses.push(address);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logForBaseOnly(
        network,
        `${network} - Error processing token fee recipients for token ${token.id}: ${errorMessage}`
      );
      continue;
    }
  }

  // Ensure all recipients are artists
  if (recipientAddresses.length > 0) {
    await ensureArtists(recipientAddresses);
  }

  // Bulk upsert into in_process_token_fee_recipients
  if (recipientsInserts.length > 0) {
    await upsertTokenFeeRecipients(recipientsInserts);
  }
}
