import React from "react";

import { PageHeading } from "@/components/PageHeading";

import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { createClient } from "@/utils/supabase/server";

import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { MainAddButton } from "@/components/MainAddButton";
import { IInspectableObjectProfileResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { Objects } from "./Objects";
import { profileIcons } from "@/lib/availableIcons";

export default async function ObjectsPage() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbActions = new DBActionsFormBuilderFetch(supabase);

  if (!user) return <div>No user! please go to login page...</div>;

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
            <div className="flex items-center space-x-2 mt-4">
              {profileIcons[profile.icon_key]}
              <h2 className=" text-slate-600">{profile.name}</h2>
            </div>
            <Objects profile={profile}></Objects>
          </li>
        ))}
      </ul>
    </div>
  );
}
