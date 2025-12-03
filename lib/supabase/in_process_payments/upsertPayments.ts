import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';

/**
 * Upserts multiple payment records into the in_process_payments table.
 * @param payments - Array of payment data objects to upsert.
 * @returns The upserted records or error.
 */
export async function upsertPayments(
  payments: Array<Database['public']['Tables']['in_process_payments']['Insert']>
): Promise<Array<Database['public']['Tables']['in_process_payments']['Row']>> {
  if (payments.length === 0) {
    console.log('ℹ️  No payments to upsert');
    return [];
  }

  const { data, error } = await supabase
    .from('in_process_payments')
    .upsert(payments, { onConflict: 'transaction_hash, buyer, moment' })
    .select();

  if (error) {
    console.error('❌ Failed to upsert payments:', error);
    throw error;
  }

  console.log(`✅ Successfully upserted ${data?.length || 0} payment(s)`);
  return data || [];
}
