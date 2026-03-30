import { Database } from '@/lib/supabase/types';
import { fetchMetadata } from '@/lib/moments/fetchMetadata';

export async function mapMetadataToSupabase(
  moments: Array<{ id: string; uri: string }>
): Promise<
  Array<Database['public']['Tables']['in_process_metadata']['Insert']>
> {
  if (!moments.length) return [];

  const metadataRecords: Array<
    Database['public']['Tables']['in_process_metadata']['Insert']
  > = [];

  await Promise.all(
    moments.map(async ({ id, uri }) => {
      try {
        const response = await fetchMetadata(uri);
        if (!response.ok) return;

        const data = await response.json();
        metadataRecords.push({
          moment: id,
          name: data.name ?? null,
          description: data.description ?? null,
          image: data.image ?? null,
          animation_url: data.animation_url ?? null,
          external_url: data.external_url ?? null,
          content: data.content ?? null,
        });
        console.log('ziad here:', uri, JSON.stringify(data));
      } catch (err) {
        console.error(`❌ Failed to fetch metadata for uri ${uri}:`, err);
      }
    })
  );

  return metadataRecords;
}
