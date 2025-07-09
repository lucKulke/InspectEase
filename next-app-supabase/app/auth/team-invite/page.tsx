import { createClient } from "@/utils/supabase/server";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { InviteClient } from "./InviteClient";
import { Suspense } from "react";

export default async function InvitePage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <InviteClient />
    </Suspense>
  );
}
