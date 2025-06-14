"use server";

import React from "react";
import { InspectionFormSelector } from "./InspectionFormSelector";
import { createClient } from "@/utils/supabase/server";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { ErrorHandler } from "@/components/ErrorHandler";
import { UUID } from "crypto";
import { PageHeading } from "@/components/PageHeading";

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

export default async function SelectFormPage() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>No User! Please go to login page...</div>;

  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const { inspectableObjectProfiles, inspectableObjectProfilesError } =
    await dbActions.fetchInspectableObjectProfiles();
  if (inspectableObjectProfilesError)
    return <ErrorHandler error={inspectableObjectProfilesError}></ErrorHandler>;

  const {
    inspectableObjectProfilePropertys,
    inspectableObjectProfilePropertysError,
  } = await dbActions.fetchAllInspectableObjectProfileObjPropertys(
    user.id as UUID
  );
  if (inspectableObjectProfilePropertysError)
    return (
      <ErrorHandler
        error={inspectableObjectProfilePropertysError}
      ></ErrorHandler>
    );

  const { inspectableObjectsWithProps, inspectableObjectsWithPropsError } =
    await dbActions.fetchAllInspectableObjectsWithProperties(user.id as UUID);
  if (inspectableObjectsWithPropsError)
    return (
      <ErrorHandler error={inspectableObjectsWithPropsError}></ErrorHandler>
    );

  const {
    inspectableObjectInspectionForms,
    inspectableObjectInspectionFormsError,
  } = await dbActions.fetchAllInspectableObjectInspectionFormsWithProps(
    user.id as UUID
  );

  if (inspectableObjectInspectionFormsError)
    return <ErrorHandler error={inspectableObjectInspectionFormsError} />;

  const {
    inspectableObjectProfileFormTypesWithProps,
    inspectableObjectProfileFormTypesWithPropsError,
  } = await dbActions.fetchAllInspectableObjectProfileFormTypesWithProps(
    user.id as UUID
  );

  if (inspectableObjectProfileFormTypesWithPropsError)
    return (
      <ErrorHandler error={inspectableObjectProfileFormTypesWithPropsError} />
    );
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbLink href="/form-filler">Forms</BreadcrumbLink>
              <BreadcrumbSeparator></BreadcrumbSeparator>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Select Form</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="m-5 ml-8 mr-8">
        <InspectionFormSelector
          profiles={inspectableObjectProfiles}
          profileProps={inspectableObjectProfilePropertys}
          objectsWithProps={inspectableObjectsWithProps}
          inspectionForms={inspectableObjectInspectionForms}
          profileFormTypes={inspectableObjectProfileFormTypesWithProps}
        ></InspectionFormSelector>
      </div>
    </>
  );
}
