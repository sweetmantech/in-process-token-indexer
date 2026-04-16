import { Database } from '@/lib/supabase/types';
import { fetchMetadata } from '@/lib/moments/fetchMetadata';

export type MapMetadataResult = {
  records: Array<Database['public']['Tables']['in_process_metadata']['Insert']>;
  artistNamesByAddresses: Map<string, string>;
};

export async function mapMetadataToSupabase(
  moments: Array<{
    id: string;
    uri: string;
    contentUri?: string;
    owner?: string;
    collection: { creator: string };
  }>
): Promise<MapMetadataResult> {
  if (!moments.length)
    return { records: [], artistNamesByAddresses: new Map() };

  const records: Array<
    Database['public']['Tables']['in_process_metadata']['Insert']
  > = [];
  const artistNamesByAddresses = new Map<string, string>();

  await Promise.all(
    moments.map(async ({ id, uri, contentUri, owner, collection }) => {
      try {
        const response = await fetchMetadata(uri, contentUri);
        if (!response.ok) return;

        const data = await response.json();
        const creatorAddress = owner ?? collection.creator;
        if (data?.artist)
          artistNamesByAddresses.set(creatorAddress, data.artist);
        records.push({
          moment: id,
          name: data.name ?? null,
          description: data.description ?? null,
          image: data.image ?? null,
          animation_url: data.animation_url ?? null,
          external_url: data.external_url ?? null,
          content: data.content ?? null,
        });
      } catch (err) {
        console.error(`❌ Failed to fetch metadata for uri ${uri}:`, err);
      }
    })
  );

  return { records, artistNamesByAddresses };
}
