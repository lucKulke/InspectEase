"use server";

import { IUserApiKeysResponse } from "@/lib/database/public/publicInterface";
import { SupabaseError } from "@/lib/globalInterfaces";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

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
