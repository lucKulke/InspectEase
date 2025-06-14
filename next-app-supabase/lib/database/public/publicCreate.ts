import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseError } from "../../globalInterfaces";
import { IUserProfileResponse } from "./publicInterface";

export class DatabasePublicCreate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }
}
