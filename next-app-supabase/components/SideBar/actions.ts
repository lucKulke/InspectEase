"use server";
import { DBActionsBucket } from "@/lib/database/bucket";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function getTeamProfilePictureUrls(
  fileName: string
): Promise<string | undefined> {
  const supabase = await createClient();
  const bucket = new DBActionsBucket(supabase);
  const { bucketResponse, bucketError } =
    await bucket.downloadProfilePicutreViaSignedUrl(fileName);

  return bucketResponse?.signedUrl;
}
