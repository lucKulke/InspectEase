"use server";

import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import {
  IInspectableObjectInspectionFormMainSectionResponse,
  IInspectableObjectInspectionFormMainSectionWithSubSectionData,
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { DBActionsFormFillerCreate } from "@/lib/database/form-filler/formFillerCreate";
import { DBActionsFormFillerFetch } from "@/lib/database/form-filler/formFillerFetch";
import {
  ICheckboxGroupInsert,
  IFillableFormInsert,
  IMainCheckboxInsert,
  IMainSectionInsert,
  ISubCheckboxInsert,
  ISubSectionInsert,
  ITaskInsert,
  ITextInputInsert,
} from "@/lib/database/form-filler/formFillerInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";
import { createClient } from "@/utils/supabase/server";
import { randomUUID, UUID } from "crypto";

export async function createFillableInspectionForm(
  newForm: IFillableFormInsert
): Promise<{ id: UUID | null; error: SupabaseError | string | null }> {
  const formBuilderSupabase = await createClient("form_builder");
  const dbActionsFormBuilder = new DBActionsFormBuilderFetch(
    formBuilderSupabase
  );
  const formFillerSupabase = await createClient("form_filler");
  const dbActionsFormFillerCreate = new DBActionsFormFillerCreate(
    formFillerSupabase
  );
  const dbActionsFormFillerFetch = new DBActionsFormFillerFetch(
    formBuilderSupabase
  );

  const {
    inspectableObjectInspectionFormMainSectionsWithSubSectionData,
    inspectableObjectInspectionFormMainSectionsWithSubSectionDataError,
  } =
    await dbActionsFormBuilder.fetchInspectableObjectInspectionFormMainSectionsWithSubSections(
      newForm.build_id
    );

  if (inspectableObjectInspectionFormMainSectionsWithSubSectionDataError)
    return {
      id: null,
      error: inspectableObjectInspectionFormMainSectionsWithSubSectionDataError,
    };
  if (!inspectableObjectInspectionFormMainSectionsWithSubSectionData)
    return {
      id: null,
      error: "unknown fetch error",
    };

  const { form, formError } =
    await dbActionsFormFillerCreate.createNewFillableForm(newForm);
  if (formError)
    return {
      id: null,
      error: formError,
    };
  if (!form)
    return {
      id: null,
      error: "unknown fetch error",
    };

  const mainSections: IMainSectionInsert[] = [];

  const subSections: ISubSectionInsert[] = [];

  const checkboxGroups: ICheckboxGroupInsert[] = [];

  const mainCheckboxes: IMainCheckboxInsert[] = [];

  const checkboxTasks: ITaskInsert[] = [];

  const subCheckboxes: ISubCheckboxInsert[] = [];

  const textInputFields: ITextInputInsert[] = [];

  if (inspectableObjectInspectionFormMainSectionsWithSubSectionData) {
    inspectableObjectInspectionFormMainSectionsWithSubSectionData.forEach(
      (mainSection) => {
        const newMainSectionId = randomUUID();

        mainSections.push({
          id: newMainSectionId,
          form_id: form.id,
          name: mainSection.name,
          description: mainSection.description,
          order_number: mainSection.order_number,
        });

        mainSection.inspectable_object_inspection_form_sub_section.forEach(
          (subSection) => {
            const newSubSectionId = randomUUID();

            subSections.push({
              id: newSubSectionId,
              name: subSection.name,
              description: subSection.description,
              order_number: subSection.order_number,
              main_section_id: newMainSectionId,
            });

            subSection.form_checkbox_group.forEach((checkboxGroup) => {
              const newCheckboxGroupId = randomUUID();
              checkboxGroups.push({
                id: newCheckboxGroupId,
                name: checkboxGroup.name,
                sub_section_id: newSubSectionId,
              });

              checkboxGroup.form_checkbox.forEach((checkbox) => {
                mainCheckboxes.push({
                  id: randomUUID(),
                  label: checkbox.label,
                  order_number: checkbox.order_number,
                  group_id: newCheckboxGroupId,
                });
              });

              checkboxGroup.form_checkbox_task.forEach((task) => {
                checkboxTasks.push({
                  id: randomUUID(),
                  description: task.description,
                  group_id: newCheckboxGroupId,
                  order_number: task.order_number,
                });
              });

              subSection.form_text_input_field.forEach((textInput) => {
                textInputFields.push({
                  id: randomUUID(),
                  placeholder_text: textInput.placeholder_text,
                  sub_section_id: newSubSectionId,
                  training_id: textInput.training_id,
                });
              });
            });
          }
        );
      }
    );
  }

  checkboxGroups.forEach((group) => {
    const tasks = checkboxTasks.filter((task) => task.group_id === group.id);

    const checkboxes = mainCheckboxes.filter(
      (checkbox) => checkbox.group_id === group.id
    );

    checkboxes.forEach((checkbox) => {
      tasks.forEach((task) => {
        subCheckboxes.push({
          id: randomUUID(),
          main_checkbox_id: checkbox.id,
          task_id: task.id,
        });
      });
    });
  });

  let error: SupabaseError | null = null;

  const { mainSectionsResponse, mainSectionsResponseError } =
    await dbActionsFormFillerCreate.createMainSections(mainSections);

  if (mainSectionsResponseError) {
    error = mainSectionsResponseError;
  } else if (mainSectionsResponse) {
    const { subSectionsResponse, subSectionsResponseError } =
      await dbActionsFormFillerCreate.createSubSections(subSections);

    if (subSectionsResponseError) {
      error = subSectionsResponseError;
    } else if (subSectionsResponse) {
      const { checkboxGroup, checkboxGroupError } =
        await dbActionsFormFillerCreate.createCheckboxGroup(checkboxGroups);

      if (checkboxGroupError) {
        error = checkboxGroupError;
      } else if (checkboxGroup) {
        const { mainCheckboxesResponse, mainCheckboxesResponseError } =
          await dbActionsFormFillerCreate.createFillableMainCheckboxes(
            mainCheckboxes
          );

        if (mainCheckboxesResponseError) {
          error = mainCheckboxesResponseError;
        }
      }
    }
  }

  if (error) {
    return { id: null, error: error };
  }

  const { tasksResponse, tasksResponseError } =
    await dbActionsFormFillerCreate.createTasks(checkboxTasks);

  if (tasksResponseError) {
    return { id: null, error: tasksResponseError };
  }

  const { subCheckboxesResponse, subCheckboxesResponseError } =
    await dbActionsFormFillerCreate.createFillableSubCheckboxes(subCheckboxes);

  if (subCheckboxesResponseError) {
    return { id: null, error: subCheckboxesResponseError };
  }

  const { textInputFieldsResponse, textInputFieldsResponseError } =
    await dbActionsFormFillerCreate.createFillableTextInputFields(
      textInputFields
    );

  if (textInputFieldsResponseError) {
    return { id: null, error: textInputFieldsResponseError };
  }

  return { id: form.id, error: null };
}
