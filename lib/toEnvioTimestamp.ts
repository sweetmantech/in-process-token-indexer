import { toChainTimestamp } from '@/lib/toChainTimestamp';

export function toEnvioTimestamp(msTimestamp: number | null): number {
  return toChainTimestamp(msTimestamp ?? new Date(0).getTime());
}
