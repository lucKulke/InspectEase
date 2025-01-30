"use server";
import { createClient } from "@/utils/supabase/server";
import { DBActionsFormBuilder } from "@/lib/database/formBuilder";

export async function fetchInspectableObjects(userId: string) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilder(supabase);

  return await dbActions.fetchInspectableObjects(userId);
}
