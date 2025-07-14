import { SupabaseClient } from "@supabase/supabase-js";
import {
  IMemberRequestInsert,
  IMemberRequestResponse,
  ITeamMembershipsResponse,
  ITeamResponse,
} from "./publicInterface";
import { SupabaseError } from "@/lib/globalInterfaces";

export class DatabasePublicDelete {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async deleteMemberRequest(userId: string): Promise<{
    memberReqeust: IMemberRequestResponse | null;
    memberReqeustError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("member_requests")
      .delete()
      .eq("user_id", userId)
      .select()
      .single();

    console.log("delete member request in db:", data);
    if (error) {
      console.error("delete member request in db error: ", error);
    }
    return {
      memberReqeust: data,
      memberReqeustError: error as SupabaseError | null,
    };
  }

  async delteTeamMembership(
    userId: string,
    teamId: string
  ): Promise<{
    deletedTeamMembership: ITeamMembershipsResponse | null;
    deletedTeamMembershipError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("team_memberships")
      .delete()
      .eq("user_id", userId)
      .eq("team_id", teamId)
      .select()
      .single();

    console.log("delete team membership in db:", data);
    if (error) {
      console.error("delete team membership in db error: ", error);
    }
    return {
      deletedTeamMembership: data,
      deletedTeamMembershipError: error as SupabaseError | null,
    };
  }

  async deleteTeamById(teamId: string): Promise<{
    deletedTeam: ITeamResponse | null;
    deletedTeamError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("teams")
      .delete()
      .eq("id", teamId)
      .select()
      .single();
    console.log("delete team in db:", data);
    if (error) {
      console.error("delete team in db error: ", error);
    }
    return {
      deletedTeam: data,
      deletedTeamError: error as SupabaseError | null,
    };
  }
}
