import { SupabaseClient } from "@supabase/supabase-js";

import { RoleType, SupabaseError } from "../../globalInterfaces";
import { UUID } from "crypto";
import {
  ITeamResponse,
  ITeamSettings,
  IUserProfileResponse,
} from "./publicInterface";
import { createClient } from "@/utils/supabase/server";

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

  async updateTeamAiTokens(
    newToken: Record<string, string>,
    teamId: UUID
  ): Promise<{
    updatedTeam: ITeamResponse | null;
    updatedTeamError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("teams") // Change to your actual table name
      .update(newToken)
      .eq("id", teamId)
      .select()
      .single();

    console.log("updated team api keys: ", data);
    if (error) {
      console.error("updated team api keys error: ", error);
    }

    return { updatedTeam: data, updatedTeamError: error };
  }

  async updateTeamSettings(teamId: UUID, newSettings: ITeamSettings) {
    const { data, error } = await this.supabase
      .from("teams") // Change to your actual table name
      .update(newSettings)
      .eq("id", teamId)
      .select()
      .single();

    console.log("updated team settings: ", data);
    if (error) {
      console.error("updated team settings error: ", error);
    }

    return { updatedTeam: data, updatedTeamError: error };
  }
  async updateMemberRoles(
    memberId: string,
    newRoles: RoleType[]
  ): Promise<{
    updatedMembership: ITeamResponse | null;
    updatedMembershipError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("team_memberships") // Change to your actual table name
      .update({ role: newRoles })
      .eq("user_id", memberId)
      .select()
      .single();

    console.log("updated member roles in db: ", data);
    if (error) {
      console.error("updated member roles in db error: ", error);
    }

    return { updatedMembership: data, updatedMembershipError: error };
  }

  async updateProfilePicture(
    userId: UUID,
    profilePicture: string
  ): Promise<{
    updatedProfile: IUserProfileResponse | null;
    updatedProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("user_profile")
      .update({ picture_id: profilePicture })
      .eq("user_id", userId)
      .select()
      .single();

    console.log("updated profile picture in db: ", data);
    if (error) {
      console.error("updated profile picture in db error: ", error);
    }

    return { updatedProfile: data, updatedProfileError: error };
  }

  async updateTeamPicture(
    teamId: UUID,
    profilePicture: string
  ): Promise<{
    updatedProfile: IUserProfileResponse | null;
    updatedProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("teams")
      .update({ picture_id: profilePicture })
      .eq("id", teamId)
      .select()
      .single();

    console.log("updated team profile picture in db: ", data);
    if (error) {
      console.error("updated team profile picture in db error: ", error);
    }

    return { updatedProfile: data, updatedProfileError: error };
  }
}
