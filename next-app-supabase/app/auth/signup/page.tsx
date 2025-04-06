"use server";
import { Suspense } from "react";

import { createClient } from "@/utils/supabase/server";
import SignupComp from "./SignupComp";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (user.user) {
    redirect("/");
  }

  return <SignupComp />;
}
