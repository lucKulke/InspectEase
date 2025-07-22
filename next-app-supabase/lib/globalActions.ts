"use server";

import { DatabasePublicUpdate } from "@/lib/database/public/publicUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function switchActiveTeam(userId: UUID, teamId: UUID | null) {
  const supabase = await createClient();
  const publicUpdate = new DatabasePublicUpdate(supabase);

  return await publicUpdate.switchActiveTeam(userId, teamId);
}

export async function passwordCheck(password: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: user?.email ?? "",
    password: password,
  });
  if (error) {
    return false;
  } else {
    return true;
  }
}
