import { logForBaseOnly } from '../logForBaseOnly.js';
import { ensureArtists } from '../artists/ensureArtists.js';
import { getSplitRecipients } from '../splits/getSplitRecipients.js';
import isSplitContract from '../splits/isSplitContract.js';
import { upsertTokenFeeRecipients } from '../supabase/in_proces_token_fee_recipients/upsertTokenFeeRecipients.js';

/**
 * Processes token fee recipients for tokens with payout recipients that are split contracts.
 * @param {string} network - The network name (for logging purposes)
 * @param {Object} token - The token object
 */
export async function processTokenFeeRecipients(network, upsertedTokens) {
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
        recipientsInserts.push({
          token: token.id,
          artist_address: token.payoutRecipient,
          percentAllocation: 100,
        });
        recipientAddresses.push(token.payoutRecipient);
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
    await upsertTokenFeeRecipients(recipientsInserts);
  }
}
