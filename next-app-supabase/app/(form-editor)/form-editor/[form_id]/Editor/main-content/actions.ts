"use server";

import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import {
  IFormCheckboxResponse,
  IFormCheckboxTaskInsert,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function updateCheckboxesOrderNumber(
  checkboxes: IFormCheckboxResponse[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);

  return await dbActions.updateFormCheckboxes(checkboxes);
}

export async function createCheckboxTask(newTask: IFormCheckboxTaskInsert) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createFormCheckboxTasks(newTask);
}
