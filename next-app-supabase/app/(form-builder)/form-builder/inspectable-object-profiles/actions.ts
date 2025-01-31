"use server";

import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { IInspectableObjectProfileInsert } from "@/lib/database/form-builder/formBuilderInterfaces";

export async function deleteProfile(profileId: UUID) {
  const supbase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supbase);

  return await dbActions.deleteInspectableObjectProfile(profileId);
}

export async function updateProfile(
  profileId: UUID,
  profileData: IInspectableObjectProfileInsert
) {
  const supbase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supbase);

  return await dbActions.updateInspectableObjectProfile(profileId, profileData);
}
