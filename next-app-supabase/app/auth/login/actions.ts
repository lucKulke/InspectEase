"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function login(data: {
  email: string;
  password: string;
}): Promise<{ code: string; message: string }> {
  const supabase = await createClient();

  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Validation Error:", result.error.format());
    redirect("/error");
  }
  const { error } = await supabase.auth.signInWithPassword(result.data);
  console.log(error?.code);
  if (error) {
    return { code: error.code ?? "unknown", message: error.message };
  } else {
    return { code: "success", message: "Successfully login in" };
  }
}
