"use server";

import { DBActionsBucket } from "@/lib/database/bucket";
import { DatabasePublicUpdate } from "@/lib/database/public/publicUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { ProfileFormValues } from "./PersonalComp";
import { SupabaseError } from "@/lib/globalInterfaces";

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
