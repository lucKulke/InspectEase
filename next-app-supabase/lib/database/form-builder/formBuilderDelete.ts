import { SupabaseClient } from "@supabase/supabase-js";
import {
  IFormCheckboxGroupResponse,
  IFormCheckboxTaskResponse,
  IFormTextInputFieldResponse,
  IInspectableObjectInspectionFormResponse,
  IInspectableObjectInspectionFormSubSectionInsert,
  IInspectableObjectInspectionFormSubSectionResponse,
  IInspectableObjectProfileFormPropertyResponse,
  IInspectableObjectProfileFormTypeInsert,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileInsert,
  IInspectableObjectProfileResponse,
  IInspectableObjectResponse,
} from "./formBuilderInterfaces";
import { SupabaseError } from "../../globalInterfaces";
import { UUID } from "crypto";

export class DBActionsFormBuilderDelete {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async deleteInspectableObjectProfile(profileId: UUID): Promise<{
    deletedInspectableObjectProfile: IInspectableObjectProfileResponse;
    deletedInspectableObjectProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .delete()
      .eq("id", profileId)
      .select();

    console.log("delete inspectable object profiles in db:", data);
    if (error) {
      console.error("delete inspectable object profiles in db error: ", error);
    }

    return {
      deletedInspectableObjectProfile: data ? data[0] : null,
      deletedInspectableObjectProfileError: error as SupabaseError | null,
    };
  }

  async deleteInspectableObjectProfileObjProperty(propertyId: UUID): Promise<{
    deletedInspectableObjectProfileObjProperty: IInspectableObjectProfileResponse;
    deletedInspectableObjectProfileObjPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_obj_property")
      .delete()
      .eq("id", propertyId)
      .select();

    console.log("delete inspectable object profile obj property in db:", data);
    if (error) {
      console.error(
        "delete inspectable object profile obj property in db error:",
        error
      );
    }

    return {
      deletedInspectableObjectProfileObjProperty: data ? data[0] : null,
      deletedInspectableObjectProfileObjPropertyError:
        error as SupabaseError | null,
    };
  }

  async deleteInspectableObjectProfileFormProperty(propertyId: UUID): Promise<{
    deletedInspectableObjectProfileFormProperty: IInspectableObjectProfileFormPropertyResponse;
    deletedInspectableObjectProfileFormPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_property")
      .delete()
      .eq("id", propertyId)
      .select();

    console.log("delete inspectable object profile form property in db:", data);
    if (error) {
      console.error(
        "delete inspectable object profile form property in db error:",
        error
      );
    }

    return {
      deletedInspectableObjectProfileFormProperty: data ? data[0] : null,
      deletedInspectableObjectProfileFormPropertyError:
        error as SupabaseError | null,
    };
  }

  async deleteInspectableObjectProfileFormTypeProp(propertyId: UUID): Promise<{
    deletedInspectableObjectProfileFormTypeProperty: IInspectableObjectProfileFormTypePropertyResponse | null;
    deletedInspectableObjectProfileFormTypePropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type_property")
      .delete()
      .eq("id", propertyId)
      .select();

    console.log(
      "delete inspectable object profile form type property in db:",
      data
    );
    if (error) {
      console.error(
        "delete inspectable object profile form type property in db error:",
        error
      );
    }

    return {
      deletedInspectableObjectProfileFormTypeProperty: data ? data[0] : null,
      deletedInspectableObjectProfileFormTypePropertyError:
        error as SupabaseError | null,
    };
  }

  async deleteProfileFormType(formTypeId: UUID): Promise<{
    deletedProfileFormType: IInspectableObjectProfileFormTypeResponse | null;
    deletedProfileFormTypeError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type")
      .delete()
      .eq("id", formTypeId)
      .select();

    console.log("delete inspectable object in db:", data);
    if (error) {
      console.error("delete inspectable object  in db error:", error);
    }

    return {
      deletedProfileFormType: data ? data[0] : null,
      deletedProfileFormTypeError: error as SupabaseError | null,
    };
  }

  async deleteInspectableObject(objectId: UUID): Promise<{
    inspectableObject: IInspectableObjectProfileResponse | null;
    inspectableObjectError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .delete()
      .eq("id", objectId)
      .select();

    console.log("delete inspectable object in db:", data);
    if (error) {
      console.error("delete inspectable object  in db error:", error);
    }

    return {
      inspectableObject: data ? data[0] : null,
      inspectableObjectError: error as SupabaseError | null,
    };
  }

  async deleteInspectionFormSubSection(subSectionId: UUID): Promise<{
    inspectableObjectInspectionFormSubSection: IInspectableObjectInspectionFormSubSectionResponse | null;
    inspectableObjectInspectionFormSubSectionError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_sub_section")
      .delete()
      .eq("id", subSectionId)
      .select();

    console.log(
      "delete inspectable object inspection form sub section in db:",
      data
    );
    if (error) {
      console.error(
        "delete inspectable object inspection form sub section in db error:",
        error
      );
    }

    return {
      inspectableObjectInspectionFormSubSection: data ? data[0] : null,
      inspectableObjectInspectionFormSubSectionError:
        error as SupabaseError | null,
    };
  }
  async deleteInspectionFormMainSection(mainSectionId: UUID): Promise<{
    inspectableObjectInspectionFormMainSection: IInspectableObjectInspectionFormSubSectionResponse | null;
    inspectableObjectInspectionFormMainSectionError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_main_section")
      .delete()
      .eq("id", mainSectionId)
      .select();

    console.log(
      "delete inspectable object inspection form main section in db:",
      data
    );
    if (error) {
      console.error(
        "delete inspectable object inspection form main section in db error:",
        error
      );
    }

    return {
      inspectableObjectInspectionFormMainSection: data ? data[0] : null,
      inspectableObjectInspectionFormMainSectionError:
        error as SupabaseError | null,
    };
  }

  async deleteCheckboxTask(taskId: UUID): Promise<{
    deletedFormCheckboxTask: IFormCheckboxTaskResponse | null;
    deletedFormCheckboxTaskError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_checkbox_task")
      .delete()
      .eq("id", taskId)
      .select();

    console.log("delete form checkbox task in db:", data);
    if (error) {
      console.error("delete form checkbox task in db error:", error);
    }

    return {
      deletedFormCheckboxTask: data ? data[0] : null,
      deletedFormCheckboxTaskError: error as SupabaseError | null,
    };
  }

  async deleteTextInputField(fieldId: UUID): Promise<{
    deletedFormTextInputField: IFormCheckboxTaskResponse | null;
    deletedFormTextInputFieldError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_text_input_field")
      .delete()
      .eq("id", fieldId)
      .select();

    console.log("delete form text input field in db:", data);
    if (error) {
      console.error("delete form text input field in db error:", error);
    }

    return {
      deletedFormTextInputField: data ? data[0] : null,
      deletedFormTextInputFieldError: error as SupabaseError | null,
    };
  }

  async deleteCheckbox(checkboxId: UUID): Promise<{
    deletedFormCheckbox: IFormCheckboxTaskResponse | null;
    deletedFormCheckboxError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_checkbox")
      .delete()
      .eq("id", checkboxId)
      .select();

    console.log("delete form checkbox in db:", data);
    if (error) {
      console.error("delete form checkbox in db error:", error);
    }

    return {
      deletedFormCheckbox: data ? data[0] : null,
      deletedFormCheckboxError: error as SupabaseError | null,
    };
  }

  async deleteAllCheckboxTasks(groupId: UUID): Promise<{
    deletedFormCheckboxTasks: IFormCheckboxTaskResponse[] | null;
    deletedFormCheckboxTasksError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_checkbox_task")
      .delete()
      .eq("group_id", groupId)
      .select();

    console.log("delete all form checkbox tasks in db:", data);
    if (error) {
      console.error("delete all form checkbox tasks in db error:", error);
    }

    return {
      deletedFormCheckboxTasks: data,
      deletedFormCheckboxTasksError: error as SupabaseError | null,
    };
  }
  async deleteCheckboxGroup(groupId: UUID): Promise<{
    deletedFormCheckboxGroup: IFormCheckboxGroupResponse[] | null;
    deletedFormCheckboxGroupError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_checkbox_group")
      .delete()
      .eq("id", groupId)
      .select();

    console.log("delete checkbox group in db:", data);
    if (error) {
      console.error("delete checkbox group in db error:", error);
    }

    return {
      deletedFormCheckboxGroup: data,
      deletedFormCheckboxGroupError: error as SupabaseError | null,
    };
  }

  async deleteAllTextInputFields(subSectionId: UUID): Promise<{
    deletedFormTextInputFields: IFormTextInputFieldResponse[] | null;
    deletedFormTextInputFieldsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_text_input_field")
      .delete()
      .eq("sub_section_id", subSectionId)
      .select();

    console.log("delete text input fields in db:", data);
    if (error) {
      console.error("delete text input fields in db error:", error);
    }

    return {
      deletedFormTextInputFields: data,
      deletedFormTextInputFieldsError: error as SupabaseError | null,
    };
  }
  async deleteEntireForm(formId: UUID): Promise<{
    deletedForm: IInspectableObjectInspectionFormResponse | null;
    deletedFormError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form")
      .delete()
      .eq("id", formId)
      .select();

    console.log("delete entire form in db:", data);
    if (error) {
      console.error("delete entire form in db error:", error);
    }

    return {
      deletedForm: data ? data[0] : null,
      deletedFormError: error as SupabaseError | null,
    };
  }
}
