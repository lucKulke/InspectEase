import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseError } from "../../globalInterfaces";
import {
  IMemberRequestInsert,
  ITeamMembershipsResponse,
  IUserProfileResponse,
} from "./publicInterface";

export class DatabasePublicCreate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async createMemberRequest(
    teamId: string,
    userId: string,
    email: string
  ): Promise<{
    memberRequest: IMemberRequestInsert | null;
    memberRequestError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("member_requests")
      .insert({ team_id: teamId, user_id: userId, email: email })
      .select()
      .single();

    console.log("create new memberRequest in db:", data);
    if (error) {
      console.error("create new memberRequest in db error: ", error);
    }

    return {
      memberRequest: data,
      memberRequestError: error as SupabaseError | null,
    };
  }

  async createTeamMembership(
    teamId: string,
    userId: string
  ): Promise<{
    teamMembership: ITeamMembershipsResponse | null;
    teamMembershipError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("team_memberships")
      .insert({ team_id: teamId, user_id: userId })
      .select()
      .single();
    console.log("create new team membership in db:", data);
    if (error) {
      console.error("create new team membership in db error: ", error);
    }
    return {
      teamMembership: data,
      teamMembershipError: error as SupabaseError | null,
    };
  }
}
