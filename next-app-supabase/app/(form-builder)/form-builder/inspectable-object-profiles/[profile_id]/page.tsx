import { createClient } from "@/utils/supabase/server";
import { ProfileCard } from "./ProfileCard";
import { PageHeading } from "@/components/PageHeading";
import { redirect } from "next/navigation";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { UUID } from "crypto";
import { ErrorHandler } from "@/components/ErrorHandler";

export default async function InspectableObjectProfilePage({
  params,
}: {
  params: Promise<{ profile_id: UUID }>;
}) {
  const profileId = (await params).profile_id;
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const {
    inspectableObjectProfileWithProps,
    inspectableObjectProfileWithPropsError,
  } = await dbActions.fetchInspectableObjectProfileWithProperties(profileId);

  if (inspectableObjectProfileWithPropsError)
    return (
      <ErrorHandler
        error={inspectableObjectProfileWithPropsError}
      ></ErrorHandler>
    );

  return (
    <div>
      <PageHeading>Profile</PageHeading>
      <div className="flex justify-center">
        {inspectableObjectProfileWithProps && (
          <ProfileCard
            profileData={inspectableObjectProfileWithProps}
          ></ProfileCard>
        )}
      </div>
    </div>
  );
}
