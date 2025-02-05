import React from "react";
import { InspectableObjectProfilesTable } from "./InspectableObjectProfilesTable";
import { PageHeading } from "@/components/PageHeading";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MainAddButton } from "@/components/MainAddButton";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";

export default async function InspectableObjectProfilesPage() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>No User! Please go to login page...</div>;

  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const { inspectableObjectProfiles, inspectableObjectProfilesError } =
    await dbActions.fetchInspectableObjectProfiles(user.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeading>Profiles</PageHeading>
        <MainAddButton
          href={formBuilderLinks["createInspectableObjectProfile"].href}
        />
      </div>
      <div className="flex justify-center m-10">
        <InspectableObjectProfilesTable
          inspectableObjectProfiles={inspectableObjectProfiles}
          inspectableObjectProfilesError={inspectableObjectProfilesError}
        />
      </div>
    </div>
  );
}
