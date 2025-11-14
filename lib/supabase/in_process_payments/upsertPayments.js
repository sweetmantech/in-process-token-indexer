import { supabase } from '../client.js';

/**
 * Upserts multiple payment records into the in_process_payments table.
 * @param {Array<Object>} payments - Array of payment data objects to upsert.
 * @returns {Promise<Object>} - The upserted records or error.
 */
export async function upsertPayments(payments) {
  // Remove duplicates based on conflict columns (hash, buyer, token)
  const uniquePayments = payments.filter(
    (payment, index, self) =>
      index ===
      self.findIndex(
        p =>
          p.hash === payment.hash &&
          p.buyer === payment.buyer &&
          p.token === payment.token
      )
  );

  // Log deduplication info if there were duplicates
  if (uniquePayments.length < payments.length) {
    console.log(
      `Deduplicated payments: ${payments.length} -> ${
        uniquePayments.length
      } (removed ${payments.length - uniquePayments.length} duplicates)`
    );
  }

  const { data, error } = await supabase
    .from('in_process_payments')
    .upsert(uniquePayments, { onConflict: 'hash, buyer, token' })
    .select();

  if (error) {
    throw error;
  }
  return data;
}
