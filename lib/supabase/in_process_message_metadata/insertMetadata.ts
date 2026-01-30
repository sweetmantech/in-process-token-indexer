import { supabase } from '../client';
import { Database } from '../types';

const insertMetadata = async ({
  artist_address,
  client,
}: Database['public']['Tables']['in_process_message_metadata']['Insert']) => {
  const { data, error } = await supabase
    .from('in_process_message_metadata')
    .insert({
      artist_address,
      client,
    })
    .select()
    .single();

  if (error) return { error, data: null };

  return { error: null, data };
};

export default insertMetadata;
