"use server";

import {
  IMainCheckboxResponse,
  ISubCheckboxResponse,
} from "@/lib/database/form-filler/formFillerInterfaces";
import { DBActionsFormFillerUpdate } from "@/lib/database/form-filler/formFillerUpdate";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";

export async function updateFormUpdateAt(
  formId: UUID,
  supabase: SupabaseClient<any, string, any>
) {
  const dbActions = new DBActionsFormFillerUpdate(supabase);

  dbActions.updateFormUpdatedAt(formId);
}

export async function updateMainCheckboxValue(
  formId: UUID,
  checkboxId: UUID,
  value: boolean
) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerUpdate(supabase);
  updateFormUpdateAt(formId, supabase);
  return await dbActions.updateMainCheckboxValue(checkboxId, value);
}

export async function updateSubCheckboxValue(
  formId: UUID,
  checkboxId: UUID,
  value: boolean
) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerUpdate(supabase);
  updateFormUpdateAt(formId, supabase);
  return await dbActions.updateSubCheckboxValue(checkboxId, value);
}

export async function upsertSubCheckboxesValues(
  checkboxes: ISubCheckboxResponse[]
) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerUpdate(supabase);
  //updateFormUpdateAt(formId, supabase);
  return await dbActions.upsertSubCheckboxesValues(checkboxes);
}

export async function upsertMainCheckboxesValues(
  checkboxes: IMainCheckboxResponse[]
) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerUpdate(supabase);
  //updateFormUpdateAt(formId, supabase);
  return await dbActions.upsertMainCheckboxesValues(checkboxes);
}

export async function updateTextInputFieldValue(
  formId: UUID,
  textInputFieldId: UUID,
  value: string
) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerUpdate(supabase);
  updateFormUpdateAt(formId, supabase);
  return await dbActions.updateTextInputField(textInputFieldId, value);
}
