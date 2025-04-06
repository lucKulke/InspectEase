"use server";
import { Suspense } from "react";

import { createClient } from "@/utils/supabase/server";
import SetPassword from "./SetPasword";
import { redirect } from "next/navigation";

export default async function SetPasswordPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user?.email) {
    redirect("/auth/login");
  }

  return <SetPassword />;
}
