import { IUserProfile, SupabaseError } from "@/lib/globalInterfaces";
import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";
import {
  IMemberRequestResponse,
  ITeamAndTeamMembers,
  ITeamMembershipsResponse,
  ITeamMembershipsWithUser,
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
    const { data, error } = await this.supabase.from("teams").select("*");

    if (error) {
      console.error("fetch all teams from user in db error: ", error);
      return {
        teams: null,
        teamsError: error as SupabaseError | null,
      };
    }

    console.log("raw teams data", data);

    // Flatten the result to remove the 'teams' wrapper
    //const teams = (data?.map((entry) => entry.teams) ?? []) as any[];

    //console.log("flattened team list:", teams);

    return {
      teams: data as ITeamResponse[],
      teamsError: null,
    };
  }

  async fetchAllTeamsAndMembers(): Promise<{
    teamsWithMembers: ITeamAndTeamMembers[] | null;
    teamsWithMembersError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("teams")
      .select(`*, team_memberships(*, user_profile(*))`);
    console.log("raw teams data", data);
    if (error) {
      console.error("fetch all teams from user in db error: ", error);
    }

    // Flatten the result to remove the 'teams' wrapper

    return {
      teamsWithMembers: data,
      teamsWithMembersError: error as SupabaseError | null,
    };
  }

  async fetchTeamAndMembers(teamId: UUID): Promise<{
    teamAndMembers: ITeamAndTeamMembers | null;
    teamAndMembersError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("teams")
      .select(`*, team_memberships(*, user_profile(*))`)
      .eq("id", teamId)
      .single();

    console.log("raw team data", data);
    if (error) {
      console.error("fetch team by id in db error: ", error);
    }

    // Flatten the result to remove the 'teams' wrapper

    return {
      teamAndMembers: data,
      teamAndMembersError: error as SupabaseError | null,
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

  async fetchTeamMembershipWithUserProfiles(
    teamId: string,
    userId: string
  ): Promise<{
    teamMembership: ITeamMembershipsWithUser | null;
    teamMembershipError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("team_memberships")
      .select(`*, user_profile(*)`)
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("fetch team memberships from db error: ", error);
    }

    return {
      teamMembership: data,
      teamMembershipError: error,
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

  async fetchTeamById(teamId: string): Promise<{
    team: ITeamAndTeamMembers | null;
    teamError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("teams")
      .select("*, team_memberships(*, user_profile(*))")
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

  async fetchMemberRequests(teamId: UUID): Promise<{
    memberRequests: IMemberRequestResponse[] | null;
    memberRequestsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("member_requests")
      .select()
      .eq("team_id", teamId);

    if (error) {
      console.error("fetch member requests from db error: ", error);
    }

    return {
      memberRequests: data,
      memberRequestsError: error,
    };
  }
}
