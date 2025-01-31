import React from "react";
import { InspectableObjectProfilesTable } from "./InspectableObjectProfilesTable";
import { PageHeading } from "@/components/PageHeading";
import { DBActionsFormBuilder } from "@/lib/database/formBuilder";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MainAddButton } from "@/components/MainAddButton";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";

export default async function InspectableObjectProfilesPage() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbActions = new DBActionsFormBuilder(supabase);

  const { inspectableObjectProfiles, inspectableObjectProfilesError } =
    await dbActions.fetchInspectableObjectProfiles(user.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeading>Form Builder</PageHeading>
        <MainAddButton
          href={formBuilderLinks["createInspectableObjectProfile"].href}
        />
      </div>
      <InspectableObjectProfilesTable
        inspectableObjectProfiles={inspectableObjectProfiles}
        inspectableObjectProfilesError={inspectableObjectProfilesError}
      />
    </div>
  );
}
