"use server";

import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import {
  IFormCheckboxInsert,
  IFormCheckboxResponse,
  IFormCheckboxTaskInsert,
  IFormCheckboxTaskResponse,
  IFormTextInputFieldResponse,
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

export async function updateCheckboxTaskOrder(
  checkboxTasks: IFormCheckboxTaskResponse[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);

  return await dbActions.updateFormCheckboxTasks(checkboxTasks);
}

export async function updateTextInputFieldOrder(
  textInputFields: IFormTextInputFieldResponse[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);

  return await dbActions.updateFormTextInputFields(textInputFields);
}

export async function createCheckboxTask(newTask: IFormCheckboxTaskInsert) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createFormCheckboxTasks(newTask);
}

export async function createCheckbox(newCheckbox: IFormCheckboxInsert) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createFormCheckbox(newCheckbox);
}

export async function deleteCheckboxTask(taskId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteCheckboxTask(taskId);
}

export async function deleteCheckbox(checkboxId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteCheckbox(checkboxId);
}
