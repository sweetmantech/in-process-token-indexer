import { supabase } from '../client';
import { Database } from '../types';

const insertMessage = async ({
  metadata,
  parts,
  role,
}: Database['public']['Tables']['in_process_messages']['Insert']) => {
  const { data, error } = await supabase
    .from('in_process_messages')
    .insert({
      metadata,
      parts,
      role,
    })
    .select()
    .single();

  if (error) return { error, data: null };

  return { error: null, data };
};

export default insertMessage;
