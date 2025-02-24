"use server";
import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import {
  IInspectableObjectInspectionFormMainSectionInsert,
  IInspectableObjectInspectionFormMainSectionResponse,
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionInsert,
  IInspectableObjectInspectionFormSubSectionResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function createNewMainSection(
  mainSection: IInspectableObjectInspectionFormMainSectionInsert
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createInspectableObjectInspectionFormMainSection(
    mainSection
  );
}

export async function deleteMainSection(subSectionId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteInspectionFormMainSection(subSectionId);
}

export async function createNewSubSection(
  subSection: IInspectableObjectInspectionFormSubSectionInsert
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createInspectableObjectInspectionFormSubSection(
    subSection
  );
}

export async function deleteSubSection(subSectionId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteInspectionFormSubSection(subSectionId);
}

export async function updateMainSectionOrder(
  mainSections: IInspectableObjectInspectionFormMainSectionResponse[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);
  return await dbActions.updateInspectableObjectInspectionFormMainSections(
    mainSections
  );
}

export async function updateSubSectionOrder(
  subSections: IInspectableObjectInspectionFormSubSectionResponse[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);
  return await dbActions.updateInspectableObjectInspectionFormSubSections(
    subSections
  );
}

export async function updateSubSection(
  subSectionId: UUID,
  newName: string,
  newDescription: string
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);
  return await dbActions.updateInspectableObjectInspectionFormSubSection(
    subSectionId,
    newName,
    newDescription
  );
}

export async function updateMainSection(
  subSectionId: UUID,
  newName: string,
  newDescription: string
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);
  return await dbActions.updateInspectableObjectInspectionFormMainSection(
    subSectionId,
    newName,
    newDescription
  );
}
