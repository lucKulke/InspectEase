"use server";
import { createClient } from "@/utils/supabase/server";
import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { IInspectableObjectProfileInsert } from "@/lib/database/form-builder/formBuilderInterfaces";

export async function createInspectableObjectProfile(
  profile: IInspectableObjectProfileInsert
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createInspectableObjectProfile(profile);
}
