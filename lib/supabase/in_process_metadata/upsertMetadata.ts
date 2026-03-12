import { Database } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase/client';

export async function upsertMetadata(
  metadata: Array<Database['public']['Tables']['in_process_metadata']['Insert']>
): Promise<void> {
  if (!metadata.length) return;

  const { error } = await supabase
    .from('in_process_metadata')
    .upsert(metadata, { onConflict: 'moment' });

  if (error) {
    console.error('❌ upsertMetadata error:', error);
    throw error;
  }

  console.log(
    `✅ upsertMetadata: Upserted ${metadata.length} metadata records`
  );
}
