import React from "react";

import { Bike, Car, Truck, Cog, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "@/components/PageHeading";
import { InspectableObjectsTable } from "./InspectableObjectsTable";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { MainAddButton } from "@/components/MainAddButton";
import { IInspectableObjectProfileResponse } from "@/lib/database/form-builder/formBuilderInterfaces";

export default async function ObjectsPage() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const { inspectableObjectProfiles, inspectableObjectProfilesError } =
    await dbActions.fetchInspectableObjectProfiles(user.id);

  function compare(
    a: IInspectableObjectProfileResponse,
    b: IInspectableObjectProfileResponse
  ) {
    if (a.created_at < b.created_at) return -1;

    if (a.created_at > b.created_at) return 1;
    return 0;
  }

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <PageHeading>All Objects</PageHeading>

        <MainAddButton
          href={formBuilderLinks["createInspectableObject"].href}
        />
      </div>
      <ul>
        {inspectableObjectProfiles.sort(compare).map((profile) => (
          <li key={profile.id}>
            <p>{profile.name}</p>
            <InspectableObjectsTable
              profile={profile}
            ></InspectableObjectsTable>
          </li>
        ))}
      </ul>
    </div>
  );
}
