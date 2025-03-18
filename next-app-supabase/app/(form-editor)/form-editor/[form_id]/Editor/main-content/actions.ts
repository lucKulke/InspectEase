"use server";

import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { IFormCheckboxResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function deleteMultipleChoiceGroup(groupId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteMultipleChoiceGroup(groupId);
}

export async function deleteSingleChoiceGroup(groupId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteSingleChoiceGroup(groupId);
}

export async function deleteTextInputGroup(groupId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteTextInputGroup(groupId);
}

export async function updateCheckboxesOrderNumber(
  checkboxes: IFormCheckboxResponse[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);

  return await dbActions.updateFormCheckboxes(checkboxes);
}
