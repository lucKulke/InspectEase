import { UUID } from "crypto";

import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { IUserProfile } from "@/lib/globalInterfaces";
import { House } from "lucide-react";
import Link from "next/link";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { redirect } from "next/navigation";
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

import TeamCard from "./TeamCard";

export default async function SecurityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <p>No user logged in</p>;

  const publicFetch = new DBActionsPublicFetch(supabase);
  const { userProfile, userProfileError } = await publicFetch.fetchUserProfile(
    user.id as UUID
  );

  if (userProfileError || !userProfile) {
    console.error("fetch user profile in db error: ", userProfileError.message);
    redirect("/error");
  }

  const { teamsWithMembers, teamsWithMembersError } =
    await publicFetch.fetchAllTeamsAndMembers();

  const teamPictureUrls = new Map<string, string | undefined>();
  if (teamsWithMembers) {
    const bucket = new DBActionsBucket(supabase);
    for (let i = 0; i < teamsWithMembers.length; i++) {
      const team = teamsWithMembers[i];
      if (team.picture_id) {
        const { bucketResponse, bucketError } =
          await bucket.downloadProfilePicutreViaSignedUrl(team.picture_id);
        teamPictureUrls.set(team.id, bucketResponse?.signedUrl);
      }
    }
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
              <BreadcrumbItem>
                <BreadcrumbPage>Teams</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="m-9">
        <TeamCard
          profileData={userProfile}
          teamsWithMembers={teamsWithMembers}
          teamPictureUrls={teamPictureUrls}
        />
      </div>
    </>
  );
}
