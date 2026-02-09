import { getIO } from '@/lib/socket/server';

export function emitMomentsCountUpdated(): void {
  const io = getIO();
  if (!io) return;

  io.emit('moments:count-updated');
}
