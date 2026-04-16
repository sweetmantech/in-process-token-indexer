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
  contentUri?: string;
  owner?: string;
};

/**
 * Builds a map keyed by the stored uri (= metadata_uri for ZoraMedia, uri otherwise).
 * Each entry carries the optional contentUri and owner for use in metadata fetching.
 */
export function getMomentUris(
  moments: AnyMoment[]
): Map<string, MomentUriEntry> {
  const momentUris = new Map<string, MomentUriEntry>();
  for (const moment of moments) {
    if ('metadata_uri' in moment && moment.metadata_uri) {
      momentUris.set(moment.metadata_uri, {
        contentUri: moment.uri ?? undefined,
        owner: moment.owner,
      });
    }
  }
  return momentUris;
}
