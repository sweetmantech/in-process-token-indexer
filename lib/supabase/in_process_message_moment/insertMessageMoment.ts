import { supabase } from '../client';
import { Database } from '../types';

const insertMessageMoment = async ({
  message,
  moment,
}: Database['public']['Tables']['in_process_message_moment']['Insert']) => {
  const { data, error } = await supabase
    .from('in_process_message_moment')
    .insert({
      message,
      moment,
    })
    .select()
    .single();

  if (error) return { error, data: null };

  return { data, error: null };
};

export default insertMessageMoment;
