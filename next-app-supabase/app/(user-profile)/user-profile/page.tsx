import { UUID } from "crypto";
import { ProfileForm } from "./profileForm";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { IUserProfile } from "@/lib/globalInterfaces";
import { House } from "lucide-react";
import Link from "next/link";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { redirect } from "next/navigation";
import { DBActionsBucket } from "@/lib/database/bucket";

export const metadata: Metadata = {
  title: "Profile | Account Settings",
  description: "Manage your account settings and preferences.",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <p>No user logged in</p>;

  const publicFetch = new DBActionsPublicFetch(supabase);
  const { userProfile, userProfileError } = await publicFetch.fetchUserProfile(
    user.id as UUID
  );
  const { userApiKeys, userApiKeysError } = await publicFetch.fetchUserApiKeys(
    user.id as UUID
  );

  const { teamsWithMembers, teamsWithMembersError } =
    await publicFetch.fetchAllTeamsAndMembers();

  if (!userProfile || !userApiKeys) {
    redirect("/error");
  }

  if (userProfileError || userApiKeysError) {
    console.error("fetch user profile in db error: ", userProfileError.message);
    console.error(
      "fetch user api keys from db error: ",
      userApiKeysError.message
    );
  }

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

  let pictureUrl: string | undefined = undefined;
  if (userProfile.picture_id) {
    const bucket = new DBActionsBucket(supabase);
    const { bucketResponse, bucketError } =
      await bucket.downloadProfilePicutreViaSignedUrl(userProfile.picture_id);
    pictureUrl = bucketResponse?.signedUrl;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className=" flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <Link href="/">
              <House></House>
            </Link>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <ProfileForm
          userApiKeys={userApiKeys}
          profileData={userProfile}
          user={user}
          teamsWithMembers={teamsWithMembers}
          teamPictureUrls={teamPictureUrls}
          pictureUrl={pictureUrl}
        />
      </div>
    </div>
  );
}
