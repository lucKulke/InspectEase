"use server";

import { DatabasePublicCreate } from "@/lib/database/public/publicCreate";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import jwt from "jsonwebtoken";
const INVITE_SECRET = process.env.INVITE_SECRET as string;

export async function createMemberRequest(
  teamId: string,
  userId: string,
  email: string
): Promise<400 | 401 | 402 | 403 | 404 | 200> {
  const supabase = await createClient();
  const publicFetch = new DBActionsPublicFetch(supabase);

  const { teamMemberships, teamMembershipsError } =
    await publicFetch.fetchTeamMemberships(teamId as UUID);
  if (teamMembershipsError) return 400;
  if (!teamMemberships) return 400;

  const filteredMemberships = teamMemberships.map((membership) => {
    if (membership.user_id === userId) {
      return membership;
    }
  });

  console.log("filteredMemberships", filteredMemberships);
  if (filteredMemberships.length !== 0) return 403;

  const publicCreate = new DatabasePublicCreate(supabase);
  const { memberRequest, memberRequestError } =
    await publicCreate.createMemberRequest(teamId, userId, email);

  if (memberRequestError) return 404;
  if (!memberRequest) return 404;

  return 200;
}

function decodeInviteToken(token: string) {
  try {
    const decoded = jwt.verify(token, INVITE_SECRET) as {
      email: string;
      teamName: string;
      teamId: string;
      exp: number;
    };

    const { teamId, teamName, exp, email: invitedEmail } = decoded;

    console.log("exp:", exp, "current:", Math.floor(Date.now() / 1000));

    return { teamId, teamName, exp, email: invitedEmail };
  } catch (error: Error | any) {
    if (error.name === "TokenExpiredError") {
      console.error("Token has expired.");
    } else {
      console.error("Invalid token:", error.message);
    }
    throw error; // Rethrow if you want upstream code to handle it
  }
}

export async function processInvitation(
  token: string
): Promise<{ teamName: string; code: number }> {
  const supabase = await createClient();
  try {
    const { teamId, teamName, exp, email } = decodeInviteToken(token); // decode locally without async

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { teamName: teamName, code: 401 };
    console.log("email check", user.email, email);
    if (user.email !== email) return { teamName: teamName, code: 402 };

    const code = await createMemberRequest(teamId, user.id, email);
    return { teamName: teamName, code: code };
  } catch (error) {
    console.error("Invitation failed:", error);
    return { teamName: "", code: 400 };
  }
}
