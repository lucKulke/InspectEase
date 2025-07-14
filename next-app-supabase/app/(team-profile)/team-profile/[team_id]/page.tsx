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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const publicFetch = new DBActionsPublicFetch(supabase);

  const { team, teamError } = await publicFetch.fetchTeamById(teamId);

  if (teamError || !team) {
    console.error("fetch team by id in db error: ", teamError);
    redirect("/error");
  }

  if (team.owner_id !== user.id) {
    redirect("/error");
  }

  const { memberRequests, memberRequestsError } =
    await publicFetch.fetchMemberRequests(teamId);

  const { teamAndMembers, teamAndMembersError } =
    await publicFetch.fetchTeamAndMembers(team.id as UUID);

  if (teamAndMembersError || !teamAndMembers) {
    console.error("fetch team by id in db error: ", teamAndMembersError);
    redirect("/error");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className=" flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Team {team.name}
            </h1>
            <Link href="/user-profile">
              <House></House>
            </Link>
          </div>
          <p className="text-muted-foreground">
            Manage your team configuration and AI API keys
          </p>
        </div>
        <TeamForm
          currentMemberRequests={memberRequests}
          teamAndMembers={teamAndMembers}
        ></TeamForm>
      </div>
    </div>
  );
}
