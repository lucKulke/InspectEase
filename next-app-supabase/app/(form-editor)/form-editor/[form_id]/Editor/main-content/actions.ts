"use server";

import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";



export async function fetchMultipleChoiceGroupWithFields(subSectionId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  return await dbActions.fetchInspectableObjectInspectionFormMultipleChoiceGroupWithFields(
    subSectionId
  );
}
export async function fetchSingleChoiceGroupWithFields(subSectionId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  return await dbActions.fetchInspectableObjectInspectionFormSingleChoiceGroupWithFields(
    subSectionId
  );
}
export async function fetchTextInputGroupWithFields(subSectionId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  return await dbActions.fetchInspectableObjectInspectionFormTextInputGroupWithFields(
    subSectionId
  );
}

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
