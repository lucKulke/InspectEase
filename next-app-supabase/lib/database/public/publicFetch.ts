import { IUserProfile, SupabaseError } from "@/lib/globalInterfaces";
import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";
import {
  ITeamMembershipsResponse,
  ITeamResponse,
  IUserApiKeysResponse,
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

  async fetchUserApiKeys(userId: UUID): Promise<{
    userApiKeys: IUserApiKeysResponse | null;
    userApiKeysError: SupabaseError;
  }> {
    let { data, error } = await this.supabase
      .from("user_api_keys")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("fetch user api keys from db error: ", error);
    }
    console.log("fetch user api keys from db:", data);

    return {
      userApiKeys: data,
      userApiKeysError: error as SupabaseError,
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

  async fetchTeamMembers(): Promise<{
    teamMembers: IUserProfileResponse[] | null;
    teamMembersError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("user_profile")
      .select(`user_id, first_name, last_name, email`);

    if (error) {
      console.error("fetch team members from db error: ", error);
    }

    return {
      teamMembers: data as IUserProfileResponse[] | null,
      teamMembersError: error,
    };
  }

  async fetchTeamMemberships(teamId: UUID): Promise<{
    teamMemberships: ITeamMembershipsResponse[] | null;
    teamMembershipsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("team_memberships")
      .select()
      .eq("team_id", teamId);

    if (error) {
      console.error("fetch team memberships from db error: ", error);
    }

    return {
      teamMemberships: data,
      teamMembershipsError: error,
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
