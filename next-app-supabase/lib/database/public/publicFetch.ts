import { IUserProfile, SupabaseError } from "@/lib/globalInterfaces";
import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";

export class DBActionsPublicFetch {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async fetchUserProfile(userId: UUID): Promise<{
    userProfile: IUserProfile | null;
    userProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("user_profile")
      .select()
      .eq("user_id", userId)
      .maybeSingle();

    console.log("fetch user profile from db:", data);
    if (error) {
      console.error("fetch user profile from db error: ", error);
    }

    return {
      userProfile: data,
      userProfileError: error as SupabaseError | null,
    };
  }
}
