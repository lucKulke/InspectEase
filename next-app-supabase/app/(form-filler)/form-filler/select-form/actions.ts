"use server";

import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { DBActionsFormFillerCreate } from "@/lib/database/form-filler/formFillerCreate";
import { DBActionsFormFillerFetch } from "@/lib/database/form-filler/formFillerFetch";
import {
  IFillableCheckboxInsert,
  IFillableFormInsert,
  IFillableTextInputFieldInsert,
} from "@/lib/database/form-filler/formFillerInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

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

  // const {
  //   inspectableObjectInspectionFormMainSectionsWithSubSectionData,
  //   inspectableObjectInspectionFormMainSectionsWithSubSectionDataError,
  // } =
  //   await dbActionsFormBuilder.fetchInspectableObjectInspectionFormMainSectionsWithSubSections(
  //     newForm.build_id
  //   );
  // if (inspectableObjectInspectionFormMainSectionsWithSubSectionDataError)
  //   return {
  //     id: null,
  //     error: inspectableObjectInspectionFormMainSectionsWithSubSectionDataError,
  //   };

  const { fields, fieldsError } =
    await dbActionsFormFillerFetch.fetchAllCheckboxesAndTextInputFieldsByFormId(
      newForm.build_id
    );
  if (fieldsError)
    return {
      id: null,
      error: fieldsError,
    };

  const { form, formError } =
    await dbActionsFormFillerCreate.createNewFillableForm(newForm);
  if (formError)
    return {
      id: null,
      error: formError,
    };
  if (form) {
    const checkboxList: IFillableCheckboxInsert[] = [];
    const textInputFieldList: IFillableTextInputFieldInsert[] = [];

    fields?.inspectable_object_inspection_form_main_section.forEach(
      (mainSection) => {
        mainSection.inspectable_object_inspection_form_sub_section.forEach(
          (subSection) => {
            subSection.form_checkbox_group.forEach((group) => {
              group.form_checkbox.forEach((checkbox) =>
                checkboxList.push({
                  checkbox_build_id: checkbox.id,
                  fillable_form_id: form.id,
                })
              );
            });
            subSection.form_text_input_field.forEach((field) =>
              textInputFieldList.push({
                text_input_build_id: field.id,
                fillable_form_id: form.id,
              })
            );
          }
        );
      }
    );

    console.log("checkbox list", checkboxList);
    console.log("text input field list", textInputFieldList);

    const { textInputFields, textInputFieldsError } =
      await dbActionsFormFillerCreate.createNewFillableTextInputFields(
        textInputFieldList
      );

    if (textInputFieldsError) {
      return { id: null, error: textInputFieldsError };
    }
    const { checkboxes, checkboxesError } =
      await dbActionsFormFillerCreate.createNewFillableCheckboxes(checkboxList);

    if (checkboxesError) {
      return { id: null, error: checkboxesError };
    }

    return { id: form.id, error: null };
  }

  return { id: null, error: "unknown" };
}
