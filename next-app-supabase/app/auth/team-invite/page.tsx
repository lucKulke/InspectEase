import { createClient } from "@/utils/supabase/server";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import InviteClient from "./InviteClient";

const INVITE_SECRET = process.env.INVITE_SECRET as string;

export default async function InvitePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  console.log("token", token);

  if (!token) {
    return <p>Invalid invitation link.</p>;
  }

  try {
    const decoded = jwt.verify(token, INVITE_SECRET) as {
      email: string;
      teamId: string;
      roles: string[];
      exp: number;
    };

    const { teamId, roles, exp, email: invitedEmail } = decoded;

    return (
      <InviteClient
        teamId={teamId}
        roles={roles}
        email={invitedEmail}
        token={token}
      />
    );
  } catch (err) {
    console.error("Invalid or expired token:", err);
    return <p>Invitation link has expired or is invalid.</p>;
  }
}
