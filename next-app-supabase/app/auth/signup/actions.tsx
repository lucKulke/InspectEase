"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  master: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signup(data: {
  master: string;
  email: string;
  password: string;
}) {
  const supabase = await createClient();

  const result = schema.safeParse(data);
  if (data.master !== process.env.MASTER_PASSWORD) {
    return "wrong_master_password";
  }

  if (!result.success) {
    console.error("Validation Error:", result.error.format());
    redirect("/error");
  }

  const { error } = await supabase.auth.signUp(result.data);
  console.log("sign up error", error);

  return error;
}
