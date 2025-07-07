import { IUserProfile, SupabaseError } from "@/lib/globalInterfaces";
import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";
import {
  ITeamResponse,
  IUserProfileDataResponse,
  IUserProfileResponse,
} from "./publicInterface";

export class DBActionsPublicFetch {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async fetchUserProfile(userId: UUID): Promise<{
    userProfile: IUserProfileResponse | null;
    userProfileError: SupabaseError;
  }> {
    let { data, error } = await this.supabase
      .from("user_profile")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("fetch user profile in db error: ", error);
    }
    console.log("fetch user profile in db:", data);

    return {
      userProfile: data,
      userProfileError: error as SupabaseError,
    };
  }
  async fetchAllTeams(user_id: UUID): Promise<{
    teams: ITeamResponse[] | null;
    teamsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("team_memberships")
      .select(`teams(*)`)
      .eq("user_id", user_id);

    if (error) {
      console.error("fetch all teams from user in db error: ", error);
      return {
        teams: null,
        teamsError: error as SupabaseError | null,
      };
    }

    console.log("raw teams data", data);

    // Flatten the result to remove the 'teams' wrapper
    const teams = (data?.map((entry) => entry.teams) ?? []) as any[];

    console.log("flattened team list:", teams);

    return {
      teams: teams as ITeamResponse[],
      teamsError: null,
    };
  }

  async fetchTeamMemberEmails(): Promise<{
    teamMemberEmails: IUserProfileDataResponse[] | null;
    teamMemberEmailsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("user_profile")
      .select(`id,first_name, last_name, email`);

    if (error) {
      console.error("fetch team member emails from db error: ", error);
    }

    return {
      teamMemberEmails: data as IUserProfileDataResponse[] | null,
      teamMemberEmailsError: error,
    };
  }

  async fetchTeamById(teamId: UUID): Promise<{
    team: ITeamResponse | null;
    teamError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();

    console.log("fetch team by id in db:", data);
    if (error) {
      console.error("fetch team by id in db error: ", error);
    }

    return {
      team: data,
      teamError: error,
    };
  }
}
