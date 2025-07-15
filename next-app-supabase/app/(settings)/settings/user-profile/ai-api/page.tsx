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

import { APIComp } from "./APIComp";

export default async function NotificationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const publicFetch = new DBActionsPublicFetch(supabase);
  const { userProfile, userProfileError } = await publicFetch.fetchUserProfile(
    user.id as UUID
  );
  const { userApiKeys, userApiKeysError } = await publicFetch.fetchUserApiKeys(
    user.id as UUID
  );

  if (!userProfile) {
    console.error("fetch user profile in db error: ", userProfileError.message);
    redirect("/error");
  }

  if (!userApiKeys) {
    console.error(
      "fetch user api keys from db error: ",
      userApiKeysError.message
    );
    redirect("/error");
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
                <BreadcrumbPage>AI APIs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="m-9">
        <APIComp userApiKeys={userApiKeys} userProfile={userProfile} />
      </div>
    </>
  );
}
