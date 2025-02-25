import { SupabaseClient } from "@supabase/supabase-js";
import {
  IInspectableObjectInspectionFormSubSectionInsert,
  IInspectableObjectInspectionFormSubSectionResponse,
  IInspectableObjectProfileFormPropertyResponse,
  IInspectableObjectProfileFormTypeInsert,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileInsert,
  IInspectableObjectProfileResponse,
  IInspectableObjectResponse,
  IMultipleChoiceGroupResponse,
  ISingleChoiceGroupResponse,
  ITextInputGroupResponse,
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

  async deleteMultipleChoiceGroup(groupId: UUID): Promise<{
    multipleChoiceGroupResponse: IMultipleChoiceGroupResponse | null;
    multipleChoiceGroupResponseError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("multiple_choice_group")
      .delete()
      .eq("id", groupId)
      .select(
        `
        *,
        multiple_choice_field(*)
        `
      );

    console.log("delete multiple choice group in db:", data);
    if (error) {
      console.error("delete multiple choice group in db error:", error);
    }

    return {
      multipleChoiceGroupResponse: data ? data[0] : null,
      multipleChoiceGroupResponseError: error as SupabaseError | null,
    };
  }

  async deleteSingleChoiceGroup(groupId: UUID): Promise<{
    singleChoiceGroupResponse: ISingleChoiceGroupResponse | null;
    singleChoiceGroupResponseError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("single_choice_group")
      .delete()
      .eq("id", groupId)
      .select(
        `
        *,
        single_choice_field(*)
        `
      );

    console.log("delete single choice group in db:", data);
    if (error) {
      console.error("delete single choice group in db error:", error);
    }

    return {
      singleChoiceGroupResponse: data ? data[0] : null,
      singleChoiceGroupResponseError: error as SupabaseError | null,
    };
  }

  async deleteTextInputGroup(groupId: UUID): Promise<{
    textInputGroupResponse: ITextInputGroupResponse | null;
    textInputGroupResponseError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("text_input_group")
      .delete()
      .eq("id", groupId)
      .select(
        `
        *,
        text_input_field(*)
        `
      );

    console.log("delete text input group in db:", data);
    if (error) {
      console.error("delete text input group in db error:", error);
    }

    return {
      textInputGroupResponse: data ? data[0] : null,
      textInputGroupResponseError: error as SupabaseError | null,
    };
  }
}
