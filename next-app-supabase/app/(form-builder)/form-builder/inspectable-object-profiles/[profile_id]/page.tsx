import { createClient } from "@/utils/supabase/server";
import { ProfileCard } from "./ProfileCard";
import { PageHeading } from "@/components/PageHeading";
import { redirect } from "next/navigation";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { UUID } from "crypto";

export default async function InspectableObjectProfilePage({
  params,
}: {
  params: Promise<{ profile_id: UUID }>;
}) {
  const profileId = (await params).profile_id;
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { inspectableObjectProfile, inspectableObjectProfilesError } =
    await dbActions.fetchInspectableObjectProfile(profileId);

  const {
    inspectableObjectProfilePropertys,
    inspectableObjectProfilePropertysError,
  } = await dbActions.fetchInspectableObjectProfilePropertys(profileId);

  return (
    <div>
      <PageHeading>Profile</PageHeading>
      <div className="flex justify-center">
        <ProfileCard
          profileData={inspectableObjectProfile}
          profileDataError={inspectableObjectProfilesError}
          profilePropertys={inspectableObjectProfilePropertys}
          profilePropertysError={inspectableObjectProfilePropertysError}
        ></ProfileCard>
      </div>
    </div>
  );
}
