"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import jwt from "jsonwebtoken";
import { createClient } from "@/utils/supabase/client";

const INVITE_SECRET = process.env.NEXT_PUBLIC_INVITE_SECRET as string; // Expose this safely

export default function InviteClient({
  teamId,
  roles,
  email,
  token,
}: {
  teamId: string;
  roles: string[];
  email: string;
  token: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function handleInvite() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace(
            `/auth/login?type=team-invite&token=${encodeURIComponent(token)}`
          );
          return;
        }

        if (user.email !== email) {
          await supabase.auth.signOut();
          router.replace(
            `/auth/login?type=team-invite&token=${encodeURIComponent(token)}`
          );
          return;
        }

        // Valid case → proceed to next page or show content
        console.log("Valid case → proceed to next page or show content");
      } catch (err) {
        console.error("Invalid or expired token", err);
        router.replace("/auth/error");
      }
    }

    handleInvite();
  }, [router, supabase, token]);

  return <p>Checking invitation link…</p>;
}
