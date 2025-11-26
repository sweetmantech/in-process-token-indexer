import toSupabaseTimestamp from '@/lib/toSupabaseTimestamp';
import { InProcess_Sales_t } from '@/types/envio';
import { Database } from '@/lib/supabase/types';
import { getMomentIdMap } from '@/lib/moments/getMomentIdMap';
import { getFeeRecipientsForSale } from './getFeeRecipientsForSale';

/**
 * Maps Envio InProcess_Sales_t entities from GraphQL
 * to the Supabase schema for upserting.
 * - Resolves collection+chain_id+token_id to moment ID.
 * - Converts BigInt fields (sale_start, sale_end, max_tokens_per_address, price_per_token) to numbers.
 * - Converts created_at from chain timestamp to ISO timestamp.
 *
 * @param sales - Array of InProcess_Sales_t from Envio.
 * @returns Promise of objects formatted for Supabase upsert.
 */
export async function mapSalesToSupabase(sales: InProcess_Sales_t[]): Promise<{
  sales: Array<Database['public']['Tables']['in_process_sales']['Insert']>;
  feeRecipients: Array<
    Database['public']['Tables']['in_process_moment_fee_recipients']['Insert']
  >;
}> {
  const mappedSales: Array<
    Database['public']['Tables']['in_process_sales']['Insert']
  > = [];
  const mappedFeeRecipients: Array<
    Database['public']['Tables']['in_process_moment_fee_recipients']['Insert']
  > = [];
  const momentIdMap = await getMomentIdMap(sales);

  for (const sale of sales) {
    const tripletKey = `${sale.collection.toLowerCase()}:${sale.chain_id}:${sale.token_id}`;
    const momentId = momentIdMap.get(tripletKey);
    if (momentId) {
      mappedSales.push({
        moment: momentId,
        currency: sale.currency,
        funds_recipient: sale.funds_recipient.toLowerCase(),
        max_tokens_per_address: Number(sale.max_tokens_per_address),
        price_per_token: Number(sale.price_per_token),
        sale_end: Number(sale.sale_end),
        sale_start: Number(sale.sale_start),
        created_at: toSupabaseTimestamp(sale.created_at),
      });
      const feeRecipients = await getFeeRecipientsForSale(sale, momentId);
      mappedFeeRecipients.push(...feeRecipients);
    }
  }

  return {
    sales: mappedSales,
    feeRecipients: mappedFeeRecipients,
  };
}
