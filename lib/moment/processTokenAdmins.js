import { logForBaseOnly } from '../logForBaseOnly.js';
import { ensureArtists } from '../artists/ensureArtists.js';
import { getSplitRecipients } from '../splits/getSplitRecipients.js';
import { upsertTokenAdmins } from '../supabase/in_process_token_admins/upsertTokenAdmins.js';
import isSplitContract from '../splits/isSplitContract.js';

/**
 * Processes token admins for tokens with payout recipients that are split contracts.
 * Filters tokens with payoutRecipientNotDefaultAdmin, checks if they're split contracts,
 * retrieves recipients, and upserts them into in_process_token_admins.
 * @param {string} network - The network name (for logging purposes)
 * @param {Array<Object>} upsertedTokens - Array of upserted token objects
 */
export async function processTokenAdmins(network, upsertedTokens) {
  // For each, get recipients (getSplitRecipients returns null if not a split contract)
  const recipientsInserts = [];
  const recipientAddresses = [];
  for (const token of upsertedTokens) {
    try {
      const isSplit = await isSplitContract(
        token.payoutRecipient,
        token.chainId
      );
      if (isSplit) {
        const recipients = await getSplitRecipients(
          token.payoutRecipient,
          token.chainId
        );
        if (recipients && recipients.length > 0) {
          for (const recipient of recipients) {
            const address = recipient.address.toLowerCase();
            // Each insert: { token_id (uuid), artist_address }
            recipientsInserts.push({
              token_id: token.id,
              artist_address: address,
            });
            // Collect addresses to ensure they're artists
            recipientAddresses.push(address);
          }
        }
      }
    } catch (err) {
      logForBaseOnly(
        network,
        `${network} - Error processing split admins for token ${token.id}: ${err.message}`
      );
      continue;
    }
  }

  // Ensure all recipients are artists
  if (recipientAddresses.length > 0) {
    await ensureArtists(recipientAddresses);
  }

  // Bulk upsert into in_process_token_admins
  if (recipientsInserts.length > 0) {
    await upsertTokenAdmins(recipientsInserts);
  }
}
