import { logForBaseOnly } from '../logForBaseOnly.js';
import { ensureArtists } from '../artists/ensureArtists.js';
import { getSplitRecipients } from '../splits/getSplitRecipients.js';
import isSplitContract from '../splits/isSplitContract.js';
import { upsertTokenFeeRecipients } from '../supabase/in_process_token_fee_recipients/upsertTokenFeeRecipients.js';
import { upsertTokenAdmins } from '../supabase/in_process_token_admins/upsertTokenAdmins.js';

/**
 * Processes token fee recipients for tokens with payout recipients (split or non-split).
 * @param {string} network - The network name (for logging purposes)
 * @param {Array<Object>} upsertedTokens - Tokens returned from upsertTokens, including payoutRecipient and chainId.
 */
export async function processSplitsRecipients(network, upsertedTokens) {
  const recipientsInserts = [];
  const recipientAddresses = [];
  const tokensWithSplitRecipients = upsertedTokens.filter(
    token => token.payoutRecipient
  );
  for (const token of tokensWithSplitRecipients) {
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
            recipientsInserts.push({
              token: token.id,
              artist_address: address,
              percentAllocation: recipient.percentAllocation,
            });
            recipientAddresses.push(address);
          }
        }
      } else {
        const address = token.payoutRecipient.toLowerCase();
        recipientsInserts.push({
          token: token.id,
          artist_address: address,
          percentAllocation: 100,
        });
        recipientAddresses.push(address);
      }
    } catch (err) {
      logForBaseOnly(
        network,
        `${network} - Error processing token fee recipients for token ${token.id}: ${err.message}`
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
    await upsertTokenAdmins(
      recipientsInserts.map(recipient => ({
        token_id: recipient.token,
        artist_address: recipient.artist_address,
      }))
    );
  }
}
