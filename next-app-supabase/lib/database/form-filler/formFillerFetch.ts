import { SupabaseClient } from "@supabase/supabase-js";

export class DBActionsFormFillerFetch {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }
}
