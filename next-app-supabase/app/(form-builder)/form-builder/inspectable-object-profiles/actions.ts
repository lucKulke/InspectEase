"use server";

import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { IInspectableObjectProfileInsert } from "@/lib/database/form-builder/formBuilderInterfaces";

export async function deleteProfiles(profileIds: UUID[]) {
  const supbase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supbase);

  return await dbActions.deleteInspectableObjectProfiles(profileIds);
}
