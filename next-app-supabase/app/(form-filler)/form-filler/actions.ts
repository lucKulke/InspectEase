"use server";

import { DBActionsFormFillerDelete } from "@/lib/database/form-filler/formFillerDelete";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function fetchFormProgress(formId: UUID) {}

export async function deleteForm(formId: UUID) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerDelete(supabase);
  return await dbActions.deleteFillableForm(formId);
}
