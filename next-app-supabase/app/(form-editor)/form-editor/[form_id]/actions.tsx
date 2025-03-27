"use server";
import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { IInspectableObjectInspectionFormPropertyInsert } from "@/lib/database/form-builder/formBuilderInterfaces";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function updateFormProperty(formPropId: UUID, prop: {}) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);

  return await dbActions.updateInspectableObjectFormProperty(formPropId, prop);
}

export async function assignFirstValueToFormProperty(
  prop: IInspectableObjectInspectionFormPropertyInsert
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createInspectableObjectInspectionFormProperty(prop);
}

export async function deleteEntireForm(formId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteEntireForm(formId);
}
