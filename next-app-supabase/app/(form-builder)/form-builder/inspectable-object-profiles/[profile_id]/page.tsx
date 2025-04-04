import { createClient } from "@/utils/supabase/server";

import { PageHeading } from "@/components/PageHeading";
import { redirect } from "next/navigation";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { UUID } from "crypto";
import { ErrorHandler } from "@/components/ErrorHandler";

import ProfileData from "./ProfileData";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { profileIcons } from "@/lib/availableIcons";

export default async function InspectableObjectProfilePage({
  params,
}: {
  params: Promise<{ profile_id: UUID }>;
}) {
  const profileId = (await params).profile_id;
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const {
    inspectableObjectProfileWithObjProps,
    inspectableObjectProfileWithObjPropsError,
  } = await dbActions.fetchInspectableObjectProfileWithObjProperties(profileId);

  if (inspectableObjectProfileWithObjPropsError)
    return (
      <ErrorHandler
        error={inspectableObjectProfileWithObjPropsError}
      ></ErrorHandler>
    );

  const {
    inspectableObjectProfileFormTypes,
    inspectableObjectProfileFormTypesError,
  } = await dbActions.fetchInspectableObjectProfileFormTypes(profileId);

  if (inspectableObjectProfileFormTypesError)
    return (
      <ErrorHandler
        error={inspectableObjectProfileFormTypesError}
      ></ErrorHandler>
    );

  const { stringExtractionTrainings, stringExtractionTrainingsError } =
    await dbActions.fetchStringExtractionTrainings(profileId);

  if (stringExtractionTrainingsError)
    return <ErrorHandler error={stringExtractionTrainingsError}></ErrorHandler>;

  if (!inspectableObjectProfileWithObjProps)
    return <div>No data available</div>;
  if (!inspectableObjectProfileFormTypes) return <div>No data available</div>;

  return (
    <div>
      <PageHeading>Profile</PageHeading>
      <div className="m-10">
        <Card className="min-w-[500px]">
          <div className="flex justify-between items-center">
            <CardHeader>
              <CardTitle>
                {inspectableObjectProfileWithObjProps?.name}
              </CardTitle>
              <CardDescription>
                {inspectableObjectProfileWithObjProps?.description}
              </CardDescription>
            </CardHeader>
            <div className="m-7">
              {inspectableObjectProfileWithObjProps?.icon_key &&
                profileIcons[inspectableObjectProfileWithObjProps.icon_key]}
            </div>
          </div>
        </Card>
        <ProfileData
          profileId={profileId}
          inspectableObjectProfileWithObjProps={
            inspectableObjectProfileWithObjProps
          }
          inspectableObjectProfileFormTypes={inspectableObjectProfileFormTypes}
          stringExtractionTrainings={stringExtractionTrainings}
        ></ProfileData>
      </div>
    </div>
  );
}
