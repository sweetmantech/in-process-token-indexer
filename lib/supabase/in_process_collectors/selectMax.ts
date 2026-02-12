import { supabase } from '@/lib/supabase/client';

/**
 * Selects the maximum value of a given field from in_process_collectors table.
 * @param fieldName - The column name to get the max value of.
 * @returns The max value as a string, or null if no records exist.
 */
export async function selectMax(fieldName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('in_process_collectors')
    .select(`${fieldName}.max()`)
    .single<{ max: string }>();

  if (error) {
    console.error(`❌ Failed to select max ${fieldName}:`, error);
    throw error;
  }

  return data?.max ?? null;
}
