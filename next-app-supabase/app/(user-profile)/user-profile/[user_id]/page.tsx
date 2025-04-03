import { UUID } from "crypto";
import { ProfileForm } from "./profileForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Account Settings",
  description: "Manage your account settings and preferences.",
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ user_id: UUID }>;
}) {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
