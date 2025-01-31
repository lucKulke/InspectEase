import { DBActionsFormBuilder } from "@/lib/database/formBuilder";
import { createClient } from "@/utils/supabase/server";

export async function fetchInspectableObjectProfiles(userId: string) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilder(supabase);

  return await dbActions.fetchInspectableObjectProfiles(userId);
}
