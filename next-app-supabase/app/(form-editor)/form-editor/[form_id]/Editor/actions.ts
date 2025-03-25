"use server";
import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import {
  IFormCheckboxGroupInsert,
  IFormCheckboxInsert,
  IInspectableObjectInspectionFormMainSectionInsert,
  IInspectableObjectInspectionFormMainSectionResponse,
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionInsert,
  IInspectableObjectInspectionFormSubSectionResponse,
  ISubSectionCore,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { deserialize } from "v8";

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

  const onlySubSectionData: ISubSectionCore[] = subSections.map(
    (subSection) => {
      const subSectionData: ISubSectionCore = {
        id: subSection.id,
        name: subSection.name,
        description: subSection.description,
        order_number: subSection.order_number,
        main_section_id: subSection.main_section_id,
        created_at: subSection.created_at,
      };
      return subSectionData;
    }
  );

  return await dbActions.updateInspectableObjectInspectionFormSubSections(
    onlySubSectionData
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

export async function createFormCheckboxes(checkboxes: IFormCheckboxInsert[]) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);
  return await dbActions.createFormCheckboxes(checkboxes);
}

export async function createFromCheckboxGroups(
  groups: IFormCheckboxGroupInsert[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);
  return await dbActions.createFormCheckboxGroups(groups);
}

export async function fetchAllFormData(formId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);
  return await dbActions.fetchInspectableObjectInspectionFormMainSectionsWithSubSections(
    formId
  );
}
