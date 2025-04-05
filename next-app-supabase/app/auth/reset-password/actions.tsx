import { createClient } from "@/utils/supabase/server";

export async function resetPassword(password: string) {
  const supabase = await createClient();
  // Update the user's password using the access token from the URL
  const { error } = await supabase.auth.updateUser({
    password,
  });

  return error;
}
