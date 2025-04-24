"use server";

import { DBActionsFormFillerDelete } from "@/lib/database/form-filler/formFillerDelete";
import { DBActionsFormFillerUpdate } from "@/lib/database/form-filler/formFillerUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function fetchFormProgress(formId: UUID) {}

export async function deleteForm(formId: UUID) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerDelete(supabase);
  return await dbActions.deleteFillableForm(formId);
}

export async function updateFormProgressState(formId: UUID, value: boolean) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerUpdate(supabase);
  return await dbActions.updateFormToComplete(formId, value);
}
