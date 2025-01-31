"use server";
import { createClient } from "@/utils/supabase/server";
import { DBActionsFormBuilder } from "@/lib/database/formBuilder";
import { IInspectableObjectProfileInsert } from "@/lib/database/formBuilderInterfaces";

export async function createInspectableObjectProfile(
  profile: IInspectableObjectProfileInsert,
  iconKey: string
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilder(supabase);

  return await dbActions.createInspectableObjectProfile(profile, iconKey);
}
