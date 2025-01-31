"use server";
import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import {
  IInspectableObjectProfilePropertyInsert,
  IInspectableObjectProfilePropertyResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { createClient } from "@/utils/supabase/server";

export async function createProfileProperty(
  property: IInspectableObjectProfilePropertyInsert
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createInspectableObjectProfileProperty(property);
}

export async function updateProfileProperty(
  property: IInspectableObjectProfilePropertyResponse[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);

  return await dbActions.updateInspectableObjectProfileProperty(property);
}
