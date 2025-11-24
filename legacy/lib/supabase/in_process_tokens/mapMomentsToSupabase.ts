import type { TokenData } from './upsertTokens';
import { safeTimestampToISO } from '../safeTimestampToISO';

interface MomentEvent {
  address?: string;
  defaultAdmin?: string;
  chainId: number;
  contractURI?: string;
  blockTimestamp?: string | number;
  payoutRecipient?: string;
  [key: string]: unknown;
}

/**
 * Maps moment events from GRPC to Supabase format for in_process_tokens table.
 * Filters out moments with missing or invalid address/defaultAdmin to prevent invalid blockchain addresses.
 * @param moments - Array of moment events from GRPC.
 * @returns The mapped objects for Supabase upsert (only valid moments with required fields).
 */
export function mapMomentsToSupabase(moments: MomentEvent[]): TokenData[] {
  return moments
    .filter(moment => {
      // Validate required fields: address and defaultAdmin must be present and non-empty
      const hasValidAddress =
        moment.address &&
        typeof moment.address === 'string' &&
        moment.address.trim().length > 0;
      const hasValidDefaultAdmin =
        moment.defaultAdmin &&
        typeof moment.defaultAdmin === 'string' &&
        moment.defaultAdmin.trim().length > 0;

      return hasValidAddress && hasValidDefaultAdmin;
    })
    .map(moment => {
      // Validate blockTimestamp before conversion to prevent runtime errors
      const timestamp = Number(moment.blockTimestamp);
      if (
        moment.blockTimestamp === null ||
        moment.blockTimestamp === undefined ||
        !Number.isFinite(timestamp) ||
        timestamp < 0
      ) {
        throw new Error(
          `Invalid blockTimestamp for address ${moment.address}: ${moment.blockTimestamp}`
        );
      }

      return {
        address: moment.address!.toLowerCase(),
        defaultAdmin: moment.defaultAdmin!.toLowerCase(),
        chainId: moment.chainId,
        tokenId: 0,
        uri: moment.contractURI,
        createdAt: safeTimestampToISO(moment.blockTimestamp),
        payoutRecipient: moment.payoutRecipient,
      };
    });
}
