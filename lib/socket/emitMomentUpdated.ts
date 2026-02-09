import { getIO } from '@/lib/socket/server';
import { InProcess_Moments_t } from '@/types/envio';

export function emitMomentUpdated(moments: InProcess_Moments_t[]): void {
  const io = getIO();
  if (!io) return;

  for (const moment of moments) {
    io.emit('moment:updated', {
      collectionAddress: moment.collection,
      tokenId: moment.token_id,
      chainId: moment.chain_id,
    });
  }
}
