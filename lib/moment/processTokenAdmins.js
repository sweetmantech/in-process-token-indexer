import { logForBaseOnly } from '../logForBaseOnly.js';
import { ensureArtists } from '../artists/ensureArtists.js';
import { getDistributors } from '../splits/getDistributors.js';
import { upsertTokenAdmins } from '../supabase/in_process_token_admins/upsertTokenAdmins.js';
import isSplitContract from '../splits/isSplitContract.js';

/**
 * Processes token admins for tokens with payout recipients that are split contracts.
 * Filters tokens with payoutRecipientNotDefaultAdmin, checks if they're split contracts,
 * retrieves distributors, and upserts them into in_process_token_admins.
 * @param {string} network - The network name (for logging purposes)
 * @param {Array<Object>} upsertedTokens - Array of upserted token objects
 */
export async function processTokenAdmins(network, upsertedTokens) {
  // For each, get distributors (getDistributors returns null if not a split contract)
  const distributorsInserts = [];
  const distributorAddresses = [];
  for (const token of upsertedTokens) {
    try {
      const isSplit = await isSplitContract(
        token.payoutRecipient,
        token.chainId
      );
      if (isSplit) {
        const distributors = await getDistributors(
          token.payoutRecipient,
          token.chainId
        );
        if (distributors && distributors.length > 0) {
          for (const distributor of distributors) {
            const address = distributor.address.toLowerCase();
            // Each insert: { token_id (uuid), artist_address }
            distributorsInserts.push({
              token_id: token.id,
              artist_address: address,
            });
            // Collect addresses to ensure they're artists
            distributorAddresses.push(address);
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

  // Ensure all distributors are artists
  if (distributorAddresses.length > 0) {
    await ensureArtists(distributorAddresses);
  }

  // Bulk upsert into in_process_token_admins
  if (distributorsInserts.length > 0) {
    await upsertTokenAdmins(distributorsInserts);
  }
}
