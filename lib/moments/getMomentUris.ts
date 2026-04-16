import type {
  Catalog_Moments_t,
  InProcess_Moments_t,
  Sound_Moments_t,
  ZoraMedia_Moments_t,
} from '@/types/envio';

type AnyMoment =
  | InProcess_Moments_t
  | Catalog_Moments_t
  | Sound_Moments_t
  | ZoraMedia_Moments_t;

export type MomentUriEntry = {
  tokenId?: string;
  contentUri?: string;
  owner?: string;
};

/**
 * Builds a map keyed by the stored uri (= metadata_uri for ZoraMedia, uri otherwise).
 * Each entry carries the optional tokenId, contentUri and owner for use in metadata fetching.
 */
export function getMomentUris(
  moments: AnyMoment[]
): Map<string, MomentUriEntry> {
  const momentUris = new Map<string, MomentUriEntry>();
  for (const moment of moments) {
    const tokenId =
      'token_id' in moment ? String(moment.token_id) : String(moment.tier + 1);
    const momentKey = `${moment.collection}:${tokenId}`;
    if ('metadata_uri' in moment && moment.metadata_uri) {
      momentUris.set(momentKey, {
        tokenId,
        contentUri: moment.uri ?? undefined,
        owner: moment.owner,
      });
    } else if (moment.uri) {
      momentUris.set(momentKey, { tokenId });
    }
  }
  return momentUris;
}
