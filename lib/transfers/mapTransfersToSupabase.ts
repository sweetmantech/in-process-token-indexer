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

  const transferMap = new Map<string, any>();

  for (const transfer of transfers) {
    const tripletKey = `${transfer.collection.toLowerCase()}:${transfer.chain_id}:${transfer.token_id}`;
    const momentId = momentIdMap.get(tripletKey);

    if (momentId) {
      const uniqueKey = `${transfer.recipient.toLowerCase()}-${transfer.transaction_hash}-${momentId}`;
      const quantityNum = Number(transfer.quantity);
      const valueNum =
        transfer.value && transfer.currency
          ? Number(
              formatUnits(
                BigInt(transfer.value),
                transfer.currency === zeroAddress ? 18 : 6
              )
            )
          : null;

      if (transferMap.has(uniqueKey)) {
        const existing = transferMap.get(uniqueKey);
        existing.quantity += quantityNum;
        console.log('Duplicated transaction hash', transfer.transaction_hash);
        if (valueNum !== null) {
          existing.value = (existing.value || 0) + valueNum;
        }
      } else {
        transferMap.set(uniqueKey, {
          id: transfer.id,
          recipient: transfer.recipient.toLowerCase(),
          quantity: quantityNum,
          value: valueNum,
          currency: transfer.currency?.toLowerCase() ?? null,
          transaction_hash: transfer.transaction_hash,
          transferred_at: toSupabaseTimestamp(transfer.transferred_at),
          moment: momentId,
        });
      }
    }
  }

  return Array.from(transferMap.values());
}
