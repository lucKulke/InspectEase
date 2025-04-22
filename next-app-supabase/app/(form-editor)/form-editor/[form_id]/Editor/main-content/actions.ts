"use server";

import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import {
  IFormCheckboxInsert,
  IFormCheckboxResponse,
  IFormCheckboxTaskInsert,
  IFormCheckboxTaskResponse,
  IFormTextInputFieldInsert,
  IFormTextInputFieldResponse,
  IStringExtractionTrainingResponse,
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

export async function createTextInputField(
  newField: IFormTextInputFieldInsert
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createFormTextInputField([newField]);
}

export async function deleteCheckboxTask(taskId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteCheckboxTask(taskId);
}

export async function deleteTextInputField(fieldId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteTextInputField(fieldId);
}

export async function deleteCheckbox(checkboxId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteCheckbox(checkboxId);
}

export async function deleteAllTasks(groupId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteAllCheckboxTasks(groupId);
}

export async function deleteCheckboxGroup(groupId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteCheckboxGroup(groupId);
}

export async function deleteAllTextInputFields(subSectionId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteAllTextInputFields(subSectionId);
}

export async function updateCheckboxGroupRules(
  groupId: UUID,
  newRules: UUID[] | null
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);

  return await dbActions.updateCheckboxGroupRules(groupId, newRules);
}

interface InspectableObjectProfile {
  string_extraction_training: IStringExtractionTrainingResponse[];
}

interface InspectableObject {
  inspectable_object_profile: InspectableObjectProfile;
}

interface FormData {
  inspectable_object: InspectableObject;
}
export async function fetchStringExtractionTrainings(formId: UUID) {
  const supabase = await createClient("form_builder");
  const { data, error } = (await supabase
    .from("inspectable_object_inspection_form")
    .select(
      `inspectable_object:object_id ( inspectable_object_profile:profile_id ( string_extraction_training ( * ) ) )`
    )
    .eq("id", formId)
    .single()) as { data: FormData | null; error: any };

  return {
    trainingList:
      data?.inspectable_object?.inspectable_object_profile
        ?.string_extraction_training,
    error: error,
  };
}

export async function updateTextInputFieldTraining(
  fieldId: UUID,
  newTrainingId: UUID
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);
  return await dbActions.updateTextInputFieldTraining(fieldId, newTrainingId);
}
