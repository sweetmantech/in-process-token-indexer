import { Database } from '@/lib/supabase/types';

export type InProcessMoment =
  Database['public']['Tables']['in_process_moments']['Row'] & {
    collection: Database['public']['Tables']['in_process_collections']['Row'];
  };
export type InProcessAdmin =
  Database['public']['Tables']['in_process_admins']['Row'] & {
    collection: Database['public']['Tables']['in_process_collections']['Row'];
  };
export type InProcessMomentComment =
  Database['public']['Tables']['in_process_moment_comments']['Row'] & {
    moment: Database['public']['Tables']['in_process_moments']['Row'];
  };
export type InProcessSale =
  Database['public']['Tables']['in_process_sales']['Row'] & {
    moment: Database['public']['Tables']['in_process_moments']['Row'];
  };
