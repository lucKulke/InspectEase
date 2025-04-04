"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function login(data: { email: string; password: string }) {
  const supabase = await createClient();

  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Validation Error:", result.error.format());
    redirect("/error");
  }

  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(data: { email: string; password: string }) {
  const supabase = await createClient();

  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Validation Error:", result.error.format());
    redirect("/error");
  }

  const { error } = await supabase.auth.signUp(result.data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
