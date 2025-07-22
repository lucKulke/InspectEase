import React from "react";
import { TeamForm } from "./teamForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { UUID } from "crypto";
import Link from "next/link";
import { House } from "lucide-react";
import { DBActionsBucket } from "@/lib/database/bucket";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

  const profilePictures: Record<UUID, string | undefined> = {};

  const bucket = new DBActionsBucket(supabase);
  for (const member of teamAndMembers.team_memberships.map(
    (m) => m.user_profile
  )) {
    if (member.picture_id) {
      const { bucketResponse, bucketError } =
        await bucket.downloadProfilePicutreViaSignedUrl(member.picture_id);
      profilePictures[member.user_id] = bucketResponse?.signedUrl || undefined;
    }
  }

  let pictureUrl: string | undefined = undefined;
  if (team.picture_id) {
    const bucket = new DBActionsBucket(supabase);
    const { bucketResponse, bucketError } =
      await bucket.downloadProfilePicutreViaSignedUrl(team.picture_id);
    pictureUrl = bucketResponse?.signedUrl;
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/settings/user-profile">
                  User Profile
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/settings/user-profile/teams">
                  Teams
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{teamAndMembers.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="m-9">
        <TeamForm
          currentMemberRequests={memberRequests}
          teamAndMembers={teamAndMembers}
          profilePictures={profilePictures}
          pictureUrl={pictureUrl}
        ></TeamForm>
      </div>
    </>
  );
}
