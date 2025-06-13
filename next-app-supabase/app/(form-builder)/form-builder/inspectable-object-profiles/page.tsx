import React from "react";

import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { createClient } from "@/utils/supabase/server";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ObjectProfilesTable } from "./ObjectProfilesTable";

export default async function InspectableObjectProfilesPage() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>No User! Please go to login page...</div>;

  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const { inspectableObjectProfiles, inspectableObjectProfilesError } =
    await dbActions.fetchInspectableObjectProfiles();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="ml-1" />
          <Separator orientation="vertical" className="mr-4 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Profiles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="p-5">
        <div className="flex justify-center m-10">
          <ObjectProfilesTable
            inspectableObjectProfiles={inspectableObjectProfiles}
            inspectableObjectProfilesError={inspectableObjectProfilesError}
          ></ObjectProfilesTable>
          {/* <InspectableObjectProfilesTable
            inspectableObjectProfiles={inspectableObjectProfiles}
            inspectableObjectProfilesError={inspectableObjectProfilesError}
          /> */}
        </div>
      </div>
    </>
  );
}
