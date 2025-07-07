import { UUID } from "crypto";
import { ProfileForm } from "./profileForm";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { IUserProfile } from "@/lib/globalInterfaces";
import { House } from "lucide-react";
import Link from "next/link";

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

  async function getOrCreateProfile(userId: string) {
    const { data, error } = await supabase
      .from("user_profile")
      .select("*")
      .eq("user_id", userId)
      .single();

    let profile: IUserProfile = data;

    return profile;
  }

  const profileData = await getOrCreateProfile(user.id);

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
        <ProfileForm profileData={profileData} user={user} />
      </div>
    </div>
  );
}
