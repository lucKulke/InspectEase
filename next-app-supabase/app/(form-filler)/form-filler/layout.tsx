import { MainNavBar } from "@/components/MainNavBar";
import Link from "next/link";
import { Edit3, Wrench } from "lucide-react";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";

import { AppSidebar } from "@/components/SideBar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { DBActionsBucket } from "@/lib/database/bucket";

interface FillerLayoutProps {
  children: ReactNode;
}

export default async function FillerLayout({ children }: FillerLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");
  const publicFetch = new DBActionsPublicFetch(supabase);
  const bucket = new DBActionsBucket(supabase);

  const { userProfile, userProfileError } = await publicFetch.fetchUserProfile(
    user.id as UUID
  );

  const { teams, teamsError } = await publicFetch.fetchAllTeams(
    user.id as UUID
  );
  let profilePicturePath: string | undefined = undefined;

  if (userProfile && userProfile.picture_id) {
    const { bucketResponse, bucketError } =
      await bucket.downloadProfilePicutreViaSignedUrl(userProfile.picture_id);

    profilePicturePath = bucketResponse?.signedUrl;
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={user}
        profile={userProfile}
        teams={teams}
        profilePicture={profilePicturePath}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
