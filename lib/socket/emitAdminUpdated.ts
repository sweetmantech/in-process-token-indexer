import { getIO } from '@/lib/socket/server';
import { InProcess_Admins_t } from '@/types/envio';

export function emitAdminUpdated(admins: InProcess_Admins_t[]): void {
  const io = getIO();
  if (!io) return;

  for (const admin of admins) {
    const isMoment = Boolean(admin.token_id);
    const eventName = `${isMoment ? 'moment' : 'collection'}:admin:updated`;
    io.emit(eventName, {
      collectionAddress: admin.collection,
      chainId: admin.chain_id,
      ...(isMoment && { tokenId: admin.token_id }),
    });
  }
}
