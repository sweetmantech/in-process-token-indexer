import { Database } from '@/lib/supabase/types';
import isSplitContract from '@/lib/splits/isSplitContract';
import { Address } from 'viem';
import { getSplitRecipients } from '@/lib/splits/getSplitRecipients';
import { InProcess_Sales_t } from '@/types/envio';

/**
 * Gets fee recipients for a sale, handling split contracts.
 * If funds_recipient is a split contract, fetches all recipients with allocations.
 * Otherwise, returns a single recipient with 100% allocation.
 *
 * @param sale - The sale entity from Envio
 * @param momentId - The moment UUID from Supabase
 * @returns Promise of fee recipient records for Supabase
 */
export async function getFeeRecipientsForSale(
  sale: InProcess_Sales_t,
  momentId: string
): Promise<
  Array<
    Database['public']['Tables']['in_process_moment_fee_recipients']['Insert']
  >
> {
  const feeRecipients: Array<
    Database['public']['Tables']['in_process_moment_fee_recipients']['Insert']
  > = [];

  const isSplit = await isSplitContract(
    sale.funds_recipient as Address,
    sale.chain_id
  );

  if (isSplit) {
    const recipients = await getSplitRecipients(
      sale.funds_recipient as Address,
      sale.chain_id
    );
    if (recipients) {
      for (const recipient of recipients) {
        feeRecipients.push({
          moment: momentId,
          artist_address: recipient.address.toLowerCase(),
          percent_allocation: Number(recipient.percentAllocation ?? 0),
        });
      }
    } else {
      console.warn(
        `⚠️  No recipients returned for split contract ${sale.funds_recipient} on chain ${sale.chain_id}`
      );
    }
  } else {
    feeRecipients.push({
      moment: momentId,
      artist_address: sale.funds_recipient.toLowerCase(),
      percent_allocation: 100,
    });
  }

  return feeRecipients;
}
