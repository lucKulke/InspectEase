"use server";

import { DBActionsFormFillerUpdate } from "@/lib/database/form-filler/formFillerUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function updateMainCheckboxValue(
  checkboxId: UUID,
  value: boolean
) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerUpdate(supabase);

  return await dbActions.updateMainCheckboxValue(checkboxId, value);
}

export async function updateCheckboxValue(checkboxId: UUID, value: boolean) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerUpdate(supabase);

  return await dbActions.updateCheckboxValue(checkboxId, value);
}

export async function updateTextInputFieldValue(
  textInputFieldId: UUID,
  value: string
) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerUpdate(supabase);

  return await dbActions.updateTextInputField(textInputFieldId, value);
}
