"use client"; // This is a separate Client Component

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordClient() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ Safe inside Client Component

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const accessToken = searchParams?.get("access_token");

  useEffect(() => {
    if (!accessToken) {
      setError("Invalid or expired reset link.");
    }
  }, [accessToken]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return setError("Password cannot be empty");

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success ? (
        <p className="text-green-500">Password updated! Redirecting...</p>
      ) : (
        <form onSubmit={handleResetPassword} className="w-full max-w-md mt-4">
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full mt-2 p-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}
