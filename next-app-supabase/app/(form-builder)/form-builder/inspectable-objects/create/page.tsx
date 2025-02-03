import { PageHeading } from "@/components/PageHeading";
import { CreateObjectCard } from "./CreateObjectCard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UUID } from "crypto";
import { fetchUsersAvailableObjectProfiles } from "./actions";

export default async function CreateObjectPage() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { inspectableObjectProfiles, inspectableObjectProfilesError } =
    await fetchUsersAvailableObjectProfiles(user.id as UUID, supabase);

  return (
    <>
      <PageHeading>Create Object</PageHeading>
      <div className="flex justify-center mt-11">
        <CreateObjectCard
          availableProfiles={inspectableObjectProfiles}
          availableProfilesError={inspectableObjectProfilesError}
        ></CreateObjectCard>
      </div>
    </>
  );
}
