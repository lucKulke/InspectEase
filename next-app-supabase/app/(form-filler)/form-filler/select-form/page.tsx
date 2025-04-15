"use server";

import React from "react";
import { InspectionFormSelector } from "./inspectionFormSelector";
import { createClient } from "@/utils/supabase/server";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { ErrorHandler } from "@/components/ErrorHandler";
import { UUID } from "crypto";
import { PageHeading } from "@/components/PageHeading";

export default async function SelectFormPage() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>No User! Please go to login page...</div>;

  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const { inspectableObjectProfiles, inspectableObjectProfilesError } =
    await dbActions.fetchInspectableObjectProfiles(user.id);
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
    <div>
      <PageHeading>Select inspection form</PageHeading>
      <InspectionFormSelector
        profiles={inspectableObjectProfiles}
        profileProps={inspectableObjectProfilePropertys}
        objects={inspectableObjectsWithProps}
        inspectionForms={inspectableObjectInspectionForms}
        profileFormTypes={inspectableObjectProfileFormTypesWithProps}
      ></InspectionFormSelector>
    </div>
  );
}
