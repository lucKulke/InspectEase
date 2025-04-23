"use server";

import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import {
  IInspectableObjectInspectionFormMainSectionResponse,
  IInspectableObjectInspectionFormMainSectionWithSubSectionData,
  IInspectableObjectInspectionFormSubSectionWithData,
  IInspectableObjectProfileObjPropertyResponse,
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

function compare(
  a: IInspectableObjectProfileObjPropertyResponse,
  b: IInspectableObjectProfileObjPropertyResponse
) {
  if (a.order_number < b.order_number) return -1;

  if (a.order_number > b.order_number) return 1;

  return 0;
}

export async function createFillableInspectionForm(data: {
  identifier_string: string;
  build_id: UUID;
}): Promise<{ id: UUID | null; error: SupabaseError | string | null }> {
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

  // get the object information
  const {
    inspectableObjectInspectionFormWithProps,
    inspectableObjectInspectionFormWithPropsError,
  } = await dbActionsFormBuilder.fetchInspectableObjectInspectionFormWithProps(
    data.build_id
  );
  if (inspectableObjectInspectionFormWithPropsError)
    return {
      id: null,
      error: inspectableObjectInspectionFormWithPropsError,
    };
  if (!inspectableObjectInspectionFormWithProps)
    return {
      id: null,
      error: inspectableObjectInspectionFormWithPropsError,
    };

  const {
    inspectableObjectWithPropertiesAndProfile,
    inspectableObjectWithPropertiesAndProfileError,
  } = await dbActionsFormBuilder.fetchInspectableObjectWithPropertiesAndProfile(
    inspectableObjectInspectionFormWithProps.object_id
  );
  if (inspectableObjectWithPropertiesAndProfileError)
    return {
      id: null,
      error: inspectableObjectWithPropertiesAndProfileError,
    };
  if (!inspectableObjectWithPropertiesAndProfile)
    return {
      id: null,
      error: "unknown fetch error",
    };

  const {
    inspectableObjectProfilePropertys,
    inspectableObjectProfilePropertysError,
  } = await dbActionsFormBuilder.fetchInspectableObjectProfileObjPropertys(
    inspectableObjectWithPropertiesAndProfile.inspectable_object_profile.id
  );

  const objectInfo: Record<string, string> = {};

  if (inspectableObjectProfilePropertys) {
    inspectableObjectProfilePropertys.sort(compare).forEach((profileProp) => {
      const objectProp =
        inspectableObjectWithPropertiesAndProfile.inspectable_object_property.filter(
          (objectProp) => objectProp.profile_property_id === profileProp.id
        )[0];

      objectInfo[profileProp.name] = objectProp ? objectProp.value : "";
    });
  }

  const {
    inspectableObjectProfileFormTypeWithProps,
    inspectableObjectProfileFormTypeWithPropsError,
  } = await dbActionsFormBuilder.fetchInspectableObjectProfileFormTypeWithProps(
    inspectableObjectInspectionFormWithProps.form_type_id
  );

  const formInfo: Record<string, string> = {};

  if (inspectableObjectProfileFormTypeWithProps) {
    inspectableObjectProfileFormTypeWithProps.inspectable_object_profile_form_type_property.forEach(
      (typeProp) => {
        const formProp =
          inspectableObjectInspectionFormWithProps.inspectable_object_inspection_form_property.filter(
            (formProp) => formProp.form_type_prop_id === typeProp.id
          )[0];
        formInfo[typeProp.name] = formProp ? formProp.value : "";
      }
    );
  }

  const newForm: IFillableFormInsert = {
    identifier_string: data.identifier_string,
    build_id: data.build_id,
    object_profile_name:
      inspectableObjectWithPropertiesAndProfile.inspectable_object_profile.name,
    object_profile_icon:
      inspectableObjectWithPropertiesAndProfile.inspectable_object_profile
        .icon_key,
    object_props: objectInfo,
    document_id: inspectableObjectInspectionFormWithProps.document_id,
    form_type: inspectableObjectProfileFormTypeWithProps?.name ?? "",
    form_props: formInfo,
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

  const {
    inspectableObjectInspectionFormMainSectionsWithSubSectionData,
    inspectableObjectInspectionFormMainSectionsWithSubSectionDataError,
  } =
    await dbActionsFormBuilder.fetchInspectableObjectInspectionFormMainSectionsWithSubSections(
      data.build_id
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
              let selectedTogether = checkboxGroup.checkboxes_selected_together;

              checkboxGroup.form_checkbox.forEach((checkbox) => {
                const newId = randomUUID();

                if (selectedTogether) {
                  if (selectedTogether.includes(checkbox.id)) {
                    selectedTogether = selectedTogether.filter(
                      (id) => id !== checkbox.id
                    );
                    selectedTogether.push(newId);
                  }
                }
                [
                  "58594353-5560-4045-a175-9a9cd0612557",
                  "fd409c06-f9f0-4efc-9212-b228a052987a",
                ];

                mainCheckboxes.push({
                  id: newId,
                  label: checkbox.label,
                  order_number: checkbox.order_number,
                  group_id: newCheckboxGroupId,
                  prio_number: checkbox.prio_number,
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

              checkboxGroups.push({
                id: newCheckboxGroupId,
                name: checkboxGroup.name,
                sub_section_id: newSubSectionId,
                checkboxes_selected_together: selectedTogether,
              });
            });
            subSection.form_text_input_field.forEach((textInput) => {
              textInputFields.push({
                id: randomUUID(),
                placeholder_text: textInput.placeholder_text,
                sub_section_id: newSubSectionId,
                training_id: textInput.training_id,
                label: textInput.label,
                order_number: textInput.order_number,
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
