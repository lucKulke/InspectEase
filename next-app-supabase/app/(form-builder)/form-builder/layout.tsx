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
// const FormBuilderNavbarIcon = () => {
//   return (
//     <Link
//       href={formBuilderLinks.home.href}
//       className="flex
//    space-x-3 items-center"
//     >
//       <Edit3 size={36}></Edit3>
//       <p className="font-bold text-xl">Form Builder</p>
//     </Link>
//   );
// };
interface BuilderLayoutProps {
  children: ReactNode;
}

export default async function BuilderLayout({ children }: BuilderLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");
  const publicFetch = new DBActionsPublicFetch(supabase);

  const { userProfile, userProfileError } = await publicFetch.fetchUserProfile(
    user.id as UUID
  );

  const { teams, teamsError } = await publicFetch.fetchAllTeams(
    user.id as UUID
  );

  return (
    <SidebarProvider>
      <AppSidebar user={user} profile={userProfile} teams={teams} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
