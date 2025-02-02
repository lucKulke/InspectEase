"use server";

import {
  IInspectableObjectProfilePropertyInsert,
  IInspectableObjectProfilePropertyResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

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

export async function deleteProfileProperty(propertyId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteInspectableObjectProfileProperty(propertyId);
}
