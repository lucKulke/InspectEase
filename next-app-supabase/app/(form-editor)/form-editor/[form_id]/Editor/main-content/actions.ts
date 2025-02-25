"use server";

import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function createMultipleChoiceGroup(subSectionId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createMultipleChoiceGroup({
    sub_section_id: subSectionId,
  });
}
export async function deleteMultipleChoiceGroup(groupId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteMultipleChoiceGroup(groupId);
}

export async function createSingleChoiceGroup(subSectionId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createSingleChoiceGroup({
    sub_section_id: subSectionId,
  });
}
export async function deleteSingleChoiceGroup(groupId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteSingleChoiceGroup(groupId);
}

export async function createTextInputGroup(subSectionId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createTextInputGroup({
    sub_section_id: subSectionId,
  });
}

export async function deleteTextInputGroup(groupId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteTextInputGroup(groupId);
}
