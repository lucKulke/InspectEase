import React from "react";
import { TeamForm } from "./teamForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { UUID } from "crypto";

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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team Settings</h1>
        <p className="text-muted-foreground">
          Manage your team configuration and AI API keys
        </p>
      </div>
      <TeamForm team={team}></TeamForm>
    </div>
  );
}
