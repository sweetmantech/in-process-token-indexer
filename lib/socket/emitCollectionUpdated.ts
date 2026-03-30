import { getIO } from '@/lib/socket/server';
import {
  Catalog_Collections_t,
  InProcess_Collections_t,
  Sound_Editions_t,
} from '@/types/envio';

export function emitCollectionUpdated(
  collections:
    | InProcess_Collections_t[]
    | Catalog_Collections_t[]
    | Sound_Editions_t[]
): void {
  const io = getIO();
  if (!io) return;

  for (const collection of collections) {
    io.emit('collection:updated', {
      collectionAddress: collection.address,
      chainId: collection.chain_id,
    });
  }
}
