"use server";

import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { ProfileFormValues } from "./profileForm";
import { IUserProfile, SupabaseError } from "@/lib/globalInterfaces";
import { IUserApiKeysResponse } from "@/lib/database/public/publicInterface";

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
