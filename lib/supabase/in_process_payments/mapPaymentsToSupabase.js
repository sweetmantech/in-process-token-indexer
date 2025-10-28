/**
 * Maps payment events from GRPC to Supabase format for in_process_payments table.
 * @param {Array<Object>} payments - Array of payment events from GRPC.
 * @returns {Array<Object>} - The mapped objects for Supabase upsert.
 */
export function mapPaymentsToSupabase(payments) {
  return payments.map(payment => ({
    hash: payment.transactionHash,
    buyer: payment.spender?.toLowerCase(), // Normalize to lowercase
    amount: payment.amount ? parseFloat(payment.amount) : null,
    block: payment.blockNumber ? parseInt(payment.blockNumber) : null,
    // Include collection and currency for token resolution
    collection: payment.collection,
    currency: payment.currency,
    // Note: token field is required but has a foreign key constraint to in_process_tokens(id)
    // This will be resolved by resolveTokensForPayments function
    token: null, // This needs to be resolved based on collection or currency
  }));
}
