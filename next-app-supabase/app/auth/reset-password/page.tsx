import { Suspense } from "react";
import { ResetPasswordClient } from "./ResetPasswordClient";
import { createClient } from "@/utils/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  return (
    <Suspense fallback={<p>Loading...</p>}>
      {user ? <ResetPasswordClient /> : <p>no user</p>}
    </Suspense>
  );
}
