"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { processInvitation } from "./actions"; // import server action
import { createClient } from "@/utils/supabase/client";

type Status = 200 | 400 | 401 | 402 | 403 | 404;

export const InviteClient = () => {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<Status | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [countdown, setCountdown] = useState(5);

  // Call the server action on mount
  useEffect(() => {
    if (!token) return;

    const runInvite = async () => {
      // Optional: pass session if needed
      const result = await processInvitation(token);
      setTeamName(result.teamName);
      setStatus(result.code as Status);
    };

    runInvite();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  // Countdown and redirect
  useEffect(() => {
    let url = "/";

    if (status === 401)
      url = `/auth/login?type=team-invite&token=${encodeURIComponent(token)}`;

    if (status === 402) url = `/form-builder`;

    if (status === 403) {
      handleSignOut();
      url = `/auth/login?type=team-invite&token=${encodeURIComponent(token)}`;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(url);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, router]);

  const statusMessage = () => {
    switch (status) {
      case 200:
        return "✅ Invitation successful! Redirecting…";
      case 400:
        return "⛔ Invalid token!";
      case 401:
        return "⛔ Unauthorized: Please log in.";
      case 402:
        return "🚫 Email mismatch: please use the correct email.";
      case 403:
        return "🚫 You are already a team member.";
      case 404:
        return "🚫 You are already requested a invitation... The team admin musst accept first.";

      default:
        return "🔍 Verifying your invitation…";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full"
      >
        <h1 className="text-2xl font-semibold mb-4">
          Team Invitation from {teamName}
        </h1>
        <p className="text-lg mb-6">{statusMessage()}</p>

        <>
          <p className="text-sm text-gray-500">
            Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}…
          </p>
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(countdown / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </>
      </motion.div>
    </div>
  );
};
