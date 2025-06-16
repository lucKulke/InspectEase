import { SupabaseClient } from "@supabase/supabase-js";

import { SupabaseError } from "../../globalInterfaces";
import { UUID } from "crypto";
import { IUserProfileResponse } from "./publicInterface";

export class DatabasePublicUpdate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async switchActiveTeam(
    userId: UUID,
    teamId: UUID | null
  ): Promise<{
    updatedProfile: IUserProfileResponse | null;
    updatedProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("user_profile")
      .update({ active_team_id: teamId })
      .eq("user_id", userId)
      .select()
      .single();

    console.log("updated users profile active team id: ", data);
    if (error) {
      console.error("updated users profile active team id error: ", error);
    }

    return {
      updatedProfile: data,
      updatedProfileError: error as SupabaseError | null,
    };
  }
}
