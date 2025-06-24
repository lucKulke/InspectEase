"use server";

import { createClient } from "@/utils/supabase/server";

export async function forgotPassword(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  console.log("forgot password", error);
  return error;
}
