import React from "react";

import { Bike, Car, Truck, Cog, Plus } from "lucide-react";
import Link from "next/link";

import { formBuilderLinks } from "@/lib/links/formBuilderLinks";

import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";
import { PageHeading } from "@/components/PageHeading";
import { formFillerLinks } from "@/lib/links/formFillerLinks";
import { FormFilter } from "./formFilter";
import { DBActionsFormFillerFetch } from "@/lib/database/form-filler/formFillerFetch";
import { UUID } from "crypto";
import { MainAddButton } from "@/components/MainAddButton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { DBActionsBucket } from "@/lib/database/bucket";

export default async function FormFillerPage() {
  const supabaseFormFiller = await createClient("form_filler");
  const supabasePublic = await createClient();
  const bucket = new DBActionsBucket(supabasePublic);

  const {
    data: { user },
  } = await supabasePublic.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const dbActionsFormFiller = new DBActionsFormFillerFetch(supabaseFormFiller);
  const dbActionsPublic = new DBActionsPublicFetch(supabasePublic);
  const wsUrl = `ws${
    process.env.APP_ENVIROMENT === "development" ? "" : "s"
  }://${process.env.SESSION_AWARENESS_FEATURE_DOMAIN}/ws/dashboard?token=${
    process.env.SESSION_AWARENESS_FEATURE_TOKEN
  }`;

  const { forms, formsError } = await dbActionsFormFiller.fetchAllFillableForms(
    user.id as UUID
  );

  const { teamMembers, teamMembersError } =
    await dbActionsPublic.fetchTeamMembers();

  const profilePictures: Record<UUID, string | undefined> = {};

  if (teamMembers) {
    for (const member of teamMembers) {
      console.log("member: ", member);
      if (member.picture_id) {
        const { bucketResponse, bucketError } =
          await bucket.downloadProfilePicutreViaSignedUrl(member.picture_id);
        profilePictures[member.user_id] =
          bucketResponse?.signedUrl || undefined;
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
                <BreadcrumbPage>Forms</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="m-5 ml-8 mr-8">
        <FormFilter
          userId={user.id}
          teamMembers={teamMembers}
          wsUrl={wsUrl}
          forms={forms}
          teamMemberProfilePictures={profilePictures}
        ></FormFilter>
      </div>
    </>
  );
}
