import { SupabaseClient } from "@supabase/supabase-js";

export class DBActionsFormFillerDelete {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }
}
