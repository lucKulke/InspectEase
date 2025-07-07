"use server";

import { DatabasePublicUpdate } from "@/lib/database/public/publicUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { TeamSettings } from "./teamForm";

export async function updateTeamAiTokens(
  newToken: Record<string, string>,
  teamId: UUID
) {
  console.log("updateTeamAiTokens", newToken, teamId);
  const supabase = await createClient();
  const publicUpdate = new DatabasePublicUpdate(supabase);
  return await publicUpdate.updateTeamAiTokens(newToken, teamId);
}

export async function updateTeamSettings(
  newSettings: TeamSettings,
  teamId: UUID
) {
  const supabase = await createClient();
  const publicUpdate = new DatabasePublicUpdate(supabase);
  return await publicUpdate.updateTeamSettings(teamId, newSettings);
}
