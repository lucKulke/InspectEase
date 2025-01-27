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

  // type-casting here for convenience
  // in practice, you should validate your inputs
  // const { email, password } = schema.parse(data);

  // const info = {
  //   email: email,
  //   password: password,
  // };
  // const data = {
  //   email: formData.get("email") as string,
  //   password: formData.get("password") as string,
  // };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(data: { email: string; password: string }) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  // const { email, password } = schema.parse(data)

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/account");
}
