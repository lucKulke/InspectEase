import React from "react";
import { TeamForm } from "./teamForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { UUID } from "crypto";
import Link from "next/link";
import { House } from "lucide-react";

export default async function TeamProfilePage({
  params,
}: {
  params: Promise<{ team_id: UUID }>;
}) {
  const teamId = (await params).team_id;

  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    redirect("/auth/login");
  }

  const publicFetch = new DBActionsPublicFetch(supabase);

  const { team, teamError } = await publicFetch.fetchTeamById(teamId);

  if (teamError || !team) {
    console.error("fetch team by id in db error: ", teamError);
    redirect("/error");
  }
  const { teamMemberships, teamMembershipsError } =
    await publicFetch.fetchTeamMemberships(teamId);

  console.log("teamMemberships", teamMemberships);

  const { teamMembers, teamMembersError } =
    await publicFetch.fetchTeamMembers();

  console.log("teamMembers", teamMembers);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Team Settings</h1>
          <Link href="/">
            <House></House>
          </Link>
        </div>
        <p className="text-muted-foreground">
          Manage your team configuration and AI API keys
        </p>
      </div>
      <TeamForm
        currentTeamMembers={teamMembers}
        currentTeamMemberships={teamMemberships}
        team={team}
      ></TeamForm>
    </div>
  );
}
