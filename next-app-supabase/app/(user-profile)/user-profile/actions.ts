"use server";

import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { ProfileFormValues } from "./profileForm";
import { IUserProfile, SupabaseError } from "@/lib/globalInterfaces";
import {
  ITeamInsert,
  IUserApiKeysResponse,
} from "@/lib/database/public/publicInterface";
import { DatabasePublicCreate } from "@/lib/database/public/publicCreate";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { DatabasePublicUpdate } from "@/lib/database/public/publicUpdate";
import { DatabasePublicDelete } from "@/lib/database/public/publicDelete";
import { randomUUID } from "crypto";
import { DBActionsBucket } from "@/lib/database/bucket";

export async function updateUserProfile(
  profileData: ProfileFormValues,
  userId: UUID
): Promise<{
  updatedProfile: ProfileFormValues;
  updatedProfileError: SupabaseError | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profile") // Change to your actual table name
    .update({
      first_name: profileData.first_name,
      last_name: profileData.last_name,
    })
    .eq("user_id", userId)
    .select()
    .single();

  console.log(error);

  return { updatedProfile: data, updatedProfileError: error };
}

export async function updateUserProfileAiTokens(
  newToken: Record<string, string>,
  userId: UUID
): Promise<{
  updatedProfile: IUserApiKeysResponse | null;
  updatedProfileError: SupabaseError | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_api_keys") // Change to your actual table name
    .update(newToken)
    .eq("user_id", userId)
    .select()
    .single();

  console.log(error);

  return { updatedProfile: data, updatedProfileError: error };
}

export async function createNewTeam(team: ITeamInsert) {
  const supabase = await createClient();
  const publicCreate = new DatabasePublicCreate(supabase);
  const { newTeam, newTeamError } = await publicCreate.createNewTeam(team);
  if (newTeamError) {
    return { newTeam: null, newTeamError };
  } else if (newTeam) {
    const { teamMembership, teamMembershipError } =
      await publicCreate.createTeamMembership(newTeam.id, team.owner_id);
    if (teamMembershipError) {
      return { newTeam: null, newTeamError: teamMembershipError };
    } else if (teamMembership) {
      const publicFetch = new DBActionsPublicFetch(supabase);
      const { team, teamError } = await publicFetch.fetchTeamById(newTeam.id);
      return { newTeam: team, newTeamError: teamError };
    }
  }
  return { newTeam: null, newTeamError };
}

export async function leaveTeam(teamId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      deletedTeamMembership: null,
      deletedTeamMembershipError: null,
    };
  const publicUpdate = new DatabasePublicDelete(supabase);
  return await publicUpdate.delteTeamMembership(user.id, teamId);
}

export async function uploadAvatar(file: File, fileName: string, userId: UUID) {
  if (!file) return { error: "No file uploaded" };
  const supabase = await createClient();
  const bucket = new DBActionsBucket(supabase);
  const publicUpdate = new DatabasePublicUpdate(supabase);

  const { bucketResponse: urlData, bucketError: bucketUploadError } =
    await bucket.uploadProfilePicture(fileName, file);

  const { bucketResponse: signedUrl, bucketError: bucketDownloadError } =
    await bucket.downloadProfilePicutreViaSignedUrl(fileName);

  const { updatedProfile, updatedProfileError } =
    await publicUpdate.updateProfilePicture(userId, fileName);

  if (bucketDownloadError || bucketUploadError || updatedProfileError) {
    return {
      success: false,
      imageUrl: null,
      path: null,
    };
  }
  return {
    success: true,
    imageUrl: signedUrl,
    path: urlData?.path,
  };
}
