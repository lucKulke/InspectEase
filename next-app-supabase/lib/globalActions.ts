"use server";

import { DatabasePublicUpdate } from "@/lib/database/public/publicUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function switchActiveTeam(profileId: UUID, teamId: UUID | null) {
  const supabase = await createClient();
  const publicUpdate = new DatabasePublicUpdate(supabase);

  return await publicUpdate.switchActiveTeam(profileId, teamId);
}
