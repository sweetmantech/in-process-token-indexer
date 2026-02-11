import { getIO } from '@/lib/socket/server';
import { InProcess_Admins_t } from '@/types/envio';

export function emitAdminUpdated(admins: InProcess_Admins_t[]): void {
  const io = getIO();
  if (!io) return;

  const seen = new Set<string>();

  for (const admin of admins) {
    const isMoment = Boolean(admin.token_id);
    const key = isMoment
      ? `${admin.collection}:${admin.token_id}:${admin.chain_id}`
      : `${admin.collection}:${admin.chain_id}`;

    if (seen.has(key)) continue;
    seen.add(key);

    const eventName = `${isMoment ? 'moment' : 'collection'}:admin:updated`;
    io.emit(eventName, {
      collectionAddress: admin.collection,
      chainId: admin.chain_id,
      ...(isMoment && { tokenId: admin.token_id }),
    });
  }
  console.log('ziad here', seen)
}
