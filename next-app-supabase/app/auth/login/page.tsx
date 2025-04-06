"use server";
import { Suspense } from "react";

import { createClient } from "@/utils/supabase/server";
import LoginComp from "./LoginComp";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (user.user) {
    console.log("is true");
    redirect("/");
  }

  return <LoginComp />;
}
