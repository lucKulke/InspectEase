"use server";

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
