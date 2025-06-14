"use server";
import { DBActionsBucket } from "@/lib/database/bucket";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function getTeamsSvgUrl(pictureId: UUID) {
  const supabase = await createClient();
  const bucket = new DBActionsBucket(supabase);
  return await bucket.getTeamsSvgUrl(pictureId);
}
