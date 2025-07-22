import type { Metadata } from "next";

import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile | Account Settings",
  description: "Manage your account settings and preferences.",
};

export default async function ProfilePage() {
  redirect("/settings/user-profile/personal");
}
