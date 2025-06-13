import React from "react";

import { PageHeading } from "@/components/PageHeading";

import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { createClient } from "@/utils/supabase/server";

import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { MainAddButton } from "@/components/MainAddButton";
import {
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectWithPropertiesResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { Objects } from "./Objects";
import { profileIcons } from "@/lib/availableIcons";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ErrorHandler } from "@/components/ErrorHandler";

export default async function ObjectsPage() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbActions = new DBActionsFormBuilderFetch(supabase);

  if (!user) return <div>No user! please go to login page...</div>;

  const { inspectableObjectProfiles, inspectableObjectProfilesError } =
    await dbActions.fetchInspectableObjectProfiles();

  const objects: Record<
    string,
    {
      profileProps: IInspectableObjectProfileObjPropertyResponse[];
      objectsWithProps: IInspectableObjectWithPropertiesResponse[];
    }
  > = {};

  for (let index = 0; index < inspectableObjectProfiles.length; index++) {
    const profile = inspectableObjectProfiles[index];
    const {
      inspectableObjectProfilePropertys,
      inspectableObjectProfilePropertysError,
    } = await dbActions.fetchInspectableObjectProfileObjPropertys(profile.id);
    if (inspectableObjectProfilePropertysError)
      return (
        <ErrorHandler
          error={inspectableObjectProfilePropertysError}
        ></ErrorHandler>
      );

    const { inspectableObjectsWitProps, inspectableObjectsWitPropsError } =
      await dbActions.fetchInspectableObjectsByProfileIdWithProperties(
        profile.id
      );
    if (inspectableObjectsWitPropsError)
      return (
        <ErrorHandler error={inspectableObjectsWitPropsError}></ErrorHandler>
      );

    objects[profile.id] = {
      profileProps: inspectableObjectProfilePropertys,
      objectsWithProps: inspectableObjectsWitProps,
    };
  }

  function compare(
    a: IInspectableObjectProfileResponse,
    b: IInspectableObjectProfileResponse
  ) {
    if (a.created_at < b.created_at) return -1;

    if (a.created_at > b.created_at) return 1;
    return 0;
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
                <BreadcrumbPage>Objects</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div>
        <Objects
          objects={objects}
          profiles={inspectableObjectProfiles.sort(compare)}
        ></Objects>
      </div>
    </>
  );
}
