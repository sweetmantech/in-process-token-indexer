import toSupabaseTimestamp from '@/lib/toSupabaseTimestamp';
import { Transfers_t } from '@/types/envio';
import { Database } from '@/lib/supabase/types';
import { getMomentIdMap } from '../moments/getMomentIdMap';
import { formatUnits, zeroAddress } from 'viem';

/** Maps Envio `Transfers` rows to `in_process_transfers` (optional `moment` when known in Supabase). */
export async function mapTransfersToSupabase(
  transfers: Transfers_t[]
): Promise<
  Array<Database['public']['Tables']['in_process_transfers']['Insert']>
> {
  const momentIdMap = await getMomentIdMap(transfers);
  const mapped: Array<
    Database['public']['Tables']['in_process_transfers']['Insert']
  > = [];

  for (const transfer of transfers) {
    const tripletKey = `${transfer.collection.toLowerCase()}:${transfer.chain_id}:${transfer.token_id}`;
    const momentId = momentIdMap.get(tripletKey);

    if (momentId) {
      mapped.push({
        id: transfer.id,
        recipient: transfer.recipient.toLowerCase(),
        quantity: Number(transfer.quantity),
        value:
          transfer.value && transfer.currency
            ? Number(
                formatUnits(
                  BigInt(transfer.value),
                  transfer.currency === zeroAddress ? 18 : 6
                )
              )
            : null,
        currency: transfer.currency?.toLowerCase() ?? null,
        transaction_hash: transfer.transaction_hash,
        transferred_at: toSupabaseTimestamp(transfer.transferred_at),
        moment: momentId,
      });
    }
  }

  return mapped;
}
