import fs from 'fs';
import path from 'path';
import { Database } from '@/lib/supabase/types';
import { fetchMetadata } from '@/lib/moments/fetchMetadata';

const FAILED_METADATA_LOG = path.resolve('failed_metadata.txt');

export type MapMetadataResult = {
  records: Array<Database['public']['Tables']['in_process_metadata']['Insert']>;
  artistNamesByAddresses: Map<string, string>;
};

export async function mapMetadataToSupabase(
  moments: Array<{
    id: string;
    uri: string;
    tokenId?: string;
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
    moments.map(async ({ id, uri, tokenId, contentUri, owner, collection }) => {
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
        console.error(
          `❌ fetchMetadata failed — tokenId: ${tokenId}, uri: ${uri}, content_uri: ${contentUri}`
        );
        const line = `${tokenId ?? ''}\t${uri}\t${contentUri ?? ''}\n`;
        fs.appendFileSync(FAILED_METADATA_LOG, line);
      }
    })
  );

  return { records, artistNamesByAddresses };
}
