import toSupabaseTimestamp from '@/lib/toSupabaseTimestamp';
import { InProcess_ERC20RewardsDeposit_t } from '@/types/envio';
import { Database } from '@/lib/supabase/types';
import { getMomentIdMapForPayments } from './getMomentIdMapForPayments';

/**
 * Maps Envio InProcess_ERC20RewardsDeposit_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Resolves collection+chain_id+token_id to moment ID.
 * - Converts amount from string to number.
 * - Converts transferred_at from chain timestamp to ISO timestamp.
 *
 * @param deposits - Array of InProcess_ERC20RewardsDeposit_t from Envio.
 * @returns Promise of objects formatted for Supabase upsert.
 */
export async function mapPaymentsToSupabase(
  deposits: InProcess_ERC20RewardsDeposit_t[]
): Promise<
  Array<Database['public']['Tables']['in_process_payments']['Insert']>
> {
  const mappedPayments: Array<
    Database['public']['Tables']['in_process_payments']['Insert']
  > = [];
  const momentIdMap = await getMomentIdMapForPayments(deposits);

  for (const deposit of deposits) {
    const tripletKey = `${deposit.collection.toLowerCase()}:${deposit.chain_id}:${deposit.token_id}`;
    const momentId = momentIdMap.get(tripletKey);

    if (momentId) {
      const amount = deposit.amount ? parseFloat(deposit.amount) : 0;
      if (amount > 0) {
        mappedPayments.push({
          id: deposit.id,
          transaction_hash: deposit.transaction_hash,
          buyer: deposit.spender.toLowerCase(),
          moment: momentId,
          amount,
          transferred_at: toSupabaseTimestamp(deposit.transferred_at),
        });
      }
    }
  }

  return mappedPayments;
}
