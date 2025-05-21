"use server";

import React from "react";
import { InspectionFormSelector } from "./inspectionFormSelector";
import { createClient } from "@/utils/supabase/server";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { ErrorHandler } from "@/components/ErrorHandler";
import { UUID } from "crypto";
import { PageHeading } from "@/components/PageHeading";
import { redirect } from "next/navigation";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";

export default async function SelectFormPage() {
  const supabase = await createClient("form_builder");
  const supabasePublic = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const publicFetchActions = new DBActionsPublicFetch(supabasePublic);
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const { userProfile, userProfileError } =
    await publicFetchActions.fetchUserProfile(user.id as UUID);
  if (userProfileError) return <ErrorHandler error={userProfileError} />;

  // Declare shared variables
  let inspectableObjectProfiles = null;
  let inspectableObjectProfilePropertys = null;
  let inspectableObjectsWithProps = null;
  let inspectableObjectInspectionForms = null;
  let inspectableObjectProfileFormTypesWithProps = null;

  if (userProfile?.team_id) {
    const { team, teamError } = await publicFetchActions.fetchTeam(
      userProfile.team_id
    );
    if (teamError) return <ErrorHandler error={teamError} />;
    if (team) {
      const members = [...team.members, team.owner_id];

      const {
        inspectableObjectProfiles: profiles,
        inspectableObjectProfilesError,
      } = await dbActions.fetchInspectableObjectProfilesFromTeam(members);
      if (inspectableObjectProfilesError)
        return <ErrorHandler error={inspectableObjectProfilesError} />;
      inspectableObjectProfiles = profiles;

      const {
        inspectableObjectProfilePropertys: props,
        inspectableObjectProfilePropertysError,
      } = await dbActions.fetchAllInspectableObjectProfileObjPropertysFromTeam(
        members
      );
      if (inspectableObjectProfilePropertysError)
        return <ErrorHandler error={inspectableObjectProfilePropertysError} />;
      inspectableObjectProfilePropertys = props;

      const {
        inspectableObjectsWithProps: objects,
        inspectableObjectsWithPropsError,
      } = await dbActions.fetchAllInspectableObjectsWithPropertiesFromTeam(
        members
      );
      if (inspectableObjectsWithPropsError)
        return <ErrorHandler error={inspectableObjectsWithPropsError} />;
      inspectableObjectsWithProps = objects;

      const {
        inspectableObjectInspectionForms: forms,
        inspectableObjectInspectionFormsError,
      } =
        await dbActions.fetchAllInspectableObjectInspectionFormsWithPropsFromTeam(
          members
        );
      if (inspectableObjectInspectionFormsError)
        return <ErrorHandler error={inspectableObjectInspectionFormsError} />;
      inspectableObjectInspectionForms = forms;

      const {
        inspectableObjectProfileFormTypesWithProps: formTypes,
        inspectableObjectProfileFormTypesWithPropsError,
      } =
        await dbActions.fetchAllInspectableObjectProfileFormTypesWithPropsFromTeam(
          members
        );
      if (inspectableObjectProfileFormTypesWithPropsError)
        return (
          <ErrorHandler
            error={inspectableObjectProfileFormTypesWithPropsError}
          />
        );
      inspectableObjectProfileFormTypesWithProps = formTypes;
    }
  } else {
    const {
      inspectableObjectProfiles: profiles,
      inspectableObjectProfilesError,
    } = await dbActions.fetchInspectableObjectProfiles(user.id);
    if (inspectableObjectProfilesError)
      return <ErrorHandler error={inspectableObjectProfilesError} />;
    inspectableObjectProfiles = profiles;

    const {
      inspectableObjectProfilePropertys: props,
      inspectableObjectProfilePropertysError,
    } = await dbActions.fetchAllInspectableObjectProfileObjPropertys(
      user.id as UUID
    );
    if (inspectableObjectProfilePropertysError)
      return <ErrorHandler error={inspectableObjectProfilePropertysError} />;
    inspectableObjectProfilePropertys = props;

    const {
      inspectableObjectsWithProps: objects,
      inspectableObjectsWithPropsError,
    } = await dbActions.fetchAllInspectableObjectsWithProperties(
      user.id as UUID
    );
    if (inspectableObjectsWithPropsError)
      return <ErrorHandler error={inspectableObjectsWithPropsError} />;
    inspectableObjectsWithProps = objects;

    const {
      inspectableObjectInspectionForms: forms,
      inspectableObjectInspectionFormsError,
    } = await dbActions.fetchAllInspectableObjectInspectionFormsWithProps(
      user.id as UUID
    );
    if (inspectableObjectInspectionFormsError)
      return <ErrorHandler error={inspectableObjectInspectionFormsError} />;
    inspectableObjectInspectionForms = forms;

    const {
      inspectableObjectProfileFormTypesWithProps: formTypes,
      inspectableObjectProfileFormTypesWithPropsError,
    } = await dbActions.fetchAllInspectableObjectProfileFormTypesWithProps(
      user.id as UUID
    );
    if (inspectableObjectProfileFormTypesWithPropsError)
      return (
        <ErrorHandler error={inspectableObjectProfileFormTypesWithPropsError} />
      );
    inspectableObjectProfileFormTypesWithProps = formTypes;
  }

  return (
    <div>
      <PageHeading>Select inspection form</PageHeading>
      {inspectableObjectProfiles &&
        inspectableObjectProfilePropertys &&
        inspectableObjectsWithProps &&
        inspectableObjectInspectionForms &&
        inspectableObjectProfileFormTypesWithProps && (
          <InspectionFormSelector
            profiles={inspectableObjectProfiles}
            profileProps={inspectableObjectProfilePropertys}
            objects={inspectableObjectsWithProps}
            inspectionForms={inspectableObjectInspectionForms}
            profileFormTypes={inspectableObjectProfileFormTypesWithProps}
          />
        )}
    </div>
  );
}
