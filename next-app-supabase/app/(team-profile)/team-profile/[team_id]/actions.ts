"use server";

import { DatabasePublicUpdate } from "@/lib/database/public/publicUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { TeamSettings } from "./teamForm";
import { RoleType } from "@/lib/globalInterfaces";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

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
  roles: string[],
  teamId: string
) {
  try {
    // 1. Create JWT payload
    const payload = {
      email,
      teamId,
      roles,
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
