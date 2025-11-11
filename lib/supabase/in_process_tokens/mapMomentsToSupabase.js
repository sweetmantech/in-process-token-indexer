/**
 * Maps moment events from GRPC to Supabase format for in_process_tokens table.
 * @param {Array<Object>} moments - Array of moment events from GRPC.
 * @returns {Array<Object>} - The mapped objects for Supabase upsert.
 */
export function mapMomentsToSupabase(moments) {
  return moments.map(moment => ({
    address: moment.address?.toLowerCase(),
    defaultAdmin: moment.defaultAdmin?.toLowerCase(),
    chainId: moment.chainId,
    tokenId: 0,
    uri: moment.contractURI,
    createdAt: new Date(Number(moment.blockTimestamp) * 1000).toISOString(),
    payoutRecipientNotDefaultAdmin: moment.payoutRecipientNotDefaultAdmin,
  }));
}
