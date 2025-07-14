"use server";

import { DatabasePublicUpdate } from "@/lib/database/public/publicUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { TeamSettings } from "./teamForm";
import { RoleType, SupabaseError } from "@/lib/globalInterfaces";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { DatabasePublicCreate } from "@/lib/database/public/publicCreate";
import { DatabasePublicDelete } from "@/lib/database/public/publicDelete";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { AuthError } from "@supabase/supabase-js";
import { ITeamResponse } from "@/lib/database/public/publicInterface";

export async function updateTeamAiTokens(
  newToken: Record<string, string>,
  teamId: UUID
) {
  console.log("updateTeamAiTokens", newToken, teamId);
  const supabase = await createClient();
  const publicUpdate = new DatabasePublicUpdate(supabase);
  return await publicUpdate.updateTeamAiTokens(newToken, teamId);
}

export async function updateTeamSettings(
  newSettings: TeamSettings,
  teamId: UUID
) {
  const supabase = await createClient();
  const publicUpdate = new DatabasePublicUpdate(supabase);
  return await publicUpdate.updateTeamSettings(teamId, newSettings);
}

export async function updateMemberRoles(
  memberId: string,
  newRoles: RoleType[]
) {
  const supabase = await createClient();
  const publicUpdate = new DatabasePublicUpdate(supabase);
  return await publicUpdate.updateMemberRoles(memberId, newRoles);
}

const APP_URL = process.env.NEXT_PUBLIC_WEBAPP_BASE_URL; // Make sure to set this in env
const INVITE_SECRET = process.env.INVITE_SECRET as string;

export async function sendTeamInviteMail(
  teamName: string,
  email: string,
  teamId: string
) {
  try {
    // 1. Create JWT payload
    const payload = {
      email,
      teamId,
      teamName,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Expires in 24 hours
    };

    // 2. Sign JWT
    const token = jwt.sign(payload, INVITE_SECRET);

    // 3. Create invitation link
    const invitationLink = `${APP_URL}/auth/team-invite?token=${encodeURIComponent(
      token
    )}`;

    // 4. Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // 5. Send email
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: `You're invited to join ${teamName}!`,
      html: `
        <h2>Invitation to join ${teamName}</h2>
        <p>Hello,</p>
        <p>You have been invited to join <strong>${teamName}</strong> on Our App.</p>
        <p><a href="${invitationLink}" target="_blank" rel="noopener">Click here to accept the invitation</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return 200;
  } catch (error) {
    console.error("Email sending failed:", error);
    return 500;
  }
}

export async function addToTeam(teamId: string, userId: string) {
  const supabase = await createClient();
  const publicUpdate = new DatabasePublicCreate(supabase);
  const publicDelete = new DatabasePublicDelete(supabase);
  console.log("addToTeam", teamId, userId);
  const { memberReqeust, memberReqeustError } =
    await publicDelete.deleteMemberRequest(userId);
  await publicUpdate.createTeamMembership(teamId, userId);
  return await new DBActionsPublicFetch(
    supabase
  ).fetchTeamMembershipWithUserProfiles(teamId, userId); // update team members from DBActionsPublicFetch
}

export async function removeTeamMember(userId: string, teamId: string) {
  const supabase = await createClient();
  const publicDelete = new DatabasePublicDelete(supabase);
  return await publicDelete.delteTeamMembership(userId, teamId);
}

export async function refetchTeamMembers() {
  const supabase = await createClient();
  const publicUpdate = new DBActionsPublicFetch(supabase);
  return await publicUpdate.fetchTeamMembers();
}

export async function deleteTeam(teamId: string) {
  const supabase = await createClient();
  const publicDelete = new DatabasePublicDelete(supabase);
  return await publicDelete.deleteTeamById(teamId);
}
