import { SupabaseClient } from "@supabase/supabase-js";
import {
  IFormCheckboxGroupInsert,
  IFormCheckboxInsert,
  IFormCheckboxResponse,
  IFormCheckboxTaskInsert,
  IFormCheckboxTaskResponse,
  IInspectableObjectInsert,
  IInspectableObjectInspectionFormAnnotationInsert,
  IInspectableObjectInspectionFormAnnotationResponse,
  IInspectableObjectInspectionFormInsert,
  IInspectableObjectInspectionFormMainSectionInsert,
  IInspectableObjectInspectionFormMainSectionResponse,
  IInspectableObjectInspectionFormPropertyInsert,
  IInspectableObjectInspectionFormResponse,
  IInspectableObjectInspectionFormSubSectionInsert,
  IInspectableObjectInspectionFormSubSectionResponse,
  IInspectableObjectInspectionFormSubSectionWithData,
  IInspectableObjectProfileFormPropertyInsert,
  IInspectableObjectProfileFormPropertyResponse,
  IInspectableObjectProfileFormTypeInsert,
  IInspectableObjectProfileFormTypePropertyInsert,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileInsert,
  IInspectableObjectProfileObjPropertyInsert,
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectPropertyInsert,
  IInspectableObjectPropertyResponse,
  IInspectableObjectResponse,
} from "./formBuilderInterfaces";
import { SupabaseError } from "../../globalInterfaces";
import { UUID } from "crypto";

export class DBActionsFormBuilderCreate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async createInspectableObjectProfile(
    profile: IInspectableObjectProfileInsert
  ): Promise<{
    inspectableObjectProfile: IInspectableObjectProfileResponse;
    inspectableObjectProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .insert([profile])
      .select();

    console.log("create inspectable object profile in db:", data);
    if (error) {
      console.error("create inspectable object profile in db error: ", error);
    }

    return {
      inspectableObjectProfile: data ? data[0] : null,
      inspectableObjectProfileError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectProfileObjProperty(
    property: IInspectableObjectProfileObjPropertyInsert
  ): Promise<{
    inspectableObjectProfileObjProperty: IInspectableObjectProfileObjPropertyResponse;
    inspectableObjectProfileObjPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_obj_property")
      .insert([property])
      .select();

    console.log("create inspectable object profile obj property in db:", data);
    if (error) {
      console.error(
        "create inspectable object profile obj property in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileObjProperty: data ? data[0] : null,
      inspectableObjectProfileObjPropertyError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectProfileFormProperty(
    property: IInspectableObjectProfileFormPropertyInsert
  ): Promise<{
    inspectableObjectProfileFormProperty: IInspectableObjectProfileFormPropertyResponse;
    inspectableObjectProfileFormPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_property")
      .insert([property])
      .select();

    console.log("create inspectable object profile form property in db:", data);
    if (error) {
      console.error(
        "create inspectable object profile property from in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileFormProperty: data ? data[0] : null,
      inspectableObjectProfileFormPropertyError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectProperty(
    propertyData: IInspectableObjectPropertyInsert[]
  ): Promise<{
    inspectableObjectPropertys: IInspectableObjectPropertyResponse[];
    inspectableObjectPropertysError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_property")
      .insert(propertyData)
      .select();

    console.log("create inspectable object property in db:", data);
    if (error) {
      console.error("create inspectable object property in db error: ", error);
    }

    return {
      inspectableObjectPropertys: data ? data : [],
      inspectableObjectPropertysError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectInspectionFormProperty(
    newProp: IInspectableObjectInspectionFormPropertyInsert
  ): Promise<{
    inspectableObjectInspectionFormProperty: IInspectableObjectPropertyResponse | null;
    inspectableObjectInspectionFormPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_property")
      .insert(newProp)
      .select();

    console.log("create inspectable object property in db:", data);
    if (error) {
      console.error("create inspectable object property in db error: ", error);
    }

    return {
      inspectableObjectInspectionFormProperty: data ? data[0] : null,
      inspectableObjectInspectionFormPropertyError:
        error as SupabaseError | null,
    };
  }

  async createInspectableObject(object: IInspectableObjectInsert): Promise<{
    inspectableObject: IInspectableObjectResponse;
    inspectableObjectError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .insert([object])
      .select();

    console.log("create inspectable object in db:", data);
    if (error) {
      console.error("create inspectable object in db error: ", error);
    }

    return {
      inspectableObject: data ? data[0] : null,
      inspectableObjectError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectProfileFormType(
    formType: IInspectableObjectProfileFormTypeInsert
  ): Promise<{
    inspectableObjectProfileFormType: IInspectableObjectProfileFormTypeResponse | null;
    inspectableObjectProfileFormTypeError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type")
      .insert([formType])
      .select();

    console.log("create inspectable object profile form type in db:", data);
    if (error) {
      console.error(
        "create inspectable object profile form type in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileFormType: data ? data[0] : null,
      inspectableObjectProfileFormTypeError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectProfileFormTypeProp(
    formTypeProp: IInspectableObjectProfileFormTypePropertyInsert
  ): Promise<{
    inspectableObjectProfileFormTypeProp: IInspectableObjectProfileFormTypePropertyResponse | null;
    inspectableObjectProfileFormTypePropError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type_property")
      .insert([formTypeProp])
      .select();

    console.log(
      "create inspectable object profile form type prop in db:",
      data
    );
    if (error) {
      console.error(
        "create inspectable object profile form type prop in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileFormTypeProp: data ? data[0] : null,
      inspectableObjectProfileFormTypePropError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectInspectionForm(
    inspectionForm: IInspectableObjectInspectionFormInsert
  ): Promise<{
    inspectableObjectInspectionForm: IInspectableObjectInspectionFormResponse | null;
    inspectableObjectInspectionFormError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form")
      .insert([inspectionForm])
      .select();

    console.log("create inspectable object inspection form in db:", data);
    if (error) {
      console.error(
        "create inspectable object inspection form in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionForm: data ? data[0] : null,
      inspectableObjectInspectionFormError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectInspectionFormProperties(
    inspectionFormProperties: IInspectableObjectInspectionFormPropertyInsert[]
  ): Promise<{
    inspectableObjectInspectionFormProperties:
      | IInspectableObjectInspectionFormPropertyInsert[]
      | null;
    inspectableObjectInspectionFormPropertiesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_property")
      .insert(inspectionFormProperties)
      .select();

    console.log(
      "create inspectable object inspection form properties in db:",
      data
    );
    if (error) {
      console.error(
        "create inspectable object inspection form properties in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionFormProperties: data,
      inspectableObjectInspectionFormPropertiesError:
        error as SupabaseError | null,
    };
  }

  async createInspectableObjectInspectionFormAnnotations(
    inspectionFormAnnotations: IInspectableObjectInspectionFormAnnotationInsert[]
  ): Promise<{
    inspectableObjectInspectionFormAnnotations:
      | IInspectableObjectInspectionFormAnnotationResponse[]
      | null;
    inspectableObjectInspectionFormAnnotationsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_annotation")
      .insert(inspectionFormAnnotations)
      .select();

    console.log(
      "create inspectable object inspection form annotations in db:",
      data
    );
    if (error) {
      console.error(
        "create inspectable object inspection form annotations in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionFormAnnotations: data,
      inspectableObjectInspectionFormAnnotationsError:
        error as SupabaseError | null,
    };
  }

  async createInspectableObjectInspectionFormMainSection(
    inspectionFormMainSection: IInspectableObjectInspectionFormMainSectionInsert
  ): Promise<{
    inspectableObjectInspectionFormMainSection: IInspectableObjectInspectionFormMainSectionResponse | null;
    inspectableObjectInspectionFormMainSectionError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_main_section")
      .insert(inspectionFormMainSection)
      .select();

    console.log(
      "create inspectable object inspection form main section in db:",
      data
    );
    if (error) {
      console.error(
        "create inspectable object inspection form main section in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionFormMainSection: data ? data[0] : null,
      inspectableObjectInspectionFormMainSectionError:
        error as SupabaseError | null,
    };
  }

  async createInspectableObjectInspectionFormSubSection(
    inspectionFormSubSection: IInspectableObjectInspectionFormSubSectionInsert
  ): Promise<{
    inspectableObjectInspectionFormSubSection: IInspectableObjectInspectionFormSubSectionWithData | null;
    inspectableObjectInspectionFormSubSectionError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_sub_section")
      .insert(inspectionFormSubSection)
      .select(
        `*, form_checkbox_group(*, form_checkbox(*)), form_text_input_field(*)`
      );

    console.log(
      "create inspectable object inspection form sub section in db:",
      data
    );
    if (error) {
      console.error(
        "create inspectable object inspection form sub section in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionFormSubSection: data ? data[0] : null,
      inspectableObjectInspectionFormSubSectionError:
        error as SupabaseError | null,
    };
  }

  async createFormCheckboxes(
    newFormCheckboxes: IFormCheckboxInsert[]
  ): Promise<{
    formCheckboxes: IFormCheckboxResponse[] | null;
    formCheckboxesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_checkbox")
      .insert(newFormCheckboxes)
      .select(`*`);

    console.log("create form checkboxes in db:", data);
    if (error) {
      console.error("create form checkboxes in db error: ", error);
    }

    return {
      formCheckboxes: data ? data : [],
      formCheckboxesError: error as SupabaseError | null,
    };
  }

  async createFormCheckbox(newFormCheckbox: IFormCheckboxInsert): Promise<{
    formCheckbox: IFormCheckboxResponse | null;
    formCheckboxError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_checkbox")
      .insert(newFormCheckbox)
      .select();

    console.log("create form checkbox in db:", data);
    if (error) {
      console.error("create form checkbox in db error: ", error);
    }

    return {
      formCheckbox: data ? data[0] : null,
      formCheckboxError: error as SupabaseError | null,
    };
  }

  async createFormCheckboxGroups(groups: IFormCheckboxGroupInsert[]): Promise<{
    formCheckboxGroups: IFormCheckboxResponse[] | null;
    formCheckboxGroupsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_checkbox_group")
      .insert(groups)
      .select(`*`);

    console.log("create form checkboxes in db:", data);
    if (error) {
      console.error("create form checkboxes in db error: ", error);
    }

    return {
      formCheckboxGroups: data ? data : [],
      formCheckboxGroupsError: error as SupabaseError | null,
    };
  }

  async createFormCheckboxTasks(newTask: IFormCheckboxTaskInsert): Promise<{
    formCheckboxTask: IFormCheckboxTaskResponse | null;
    formCheckboxTaskError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_checkbox_task")
      .insert(newTask)
      .select(`*`);

    console.log("create form checkbox task in db:", data);
    if (error) {
      console.error("create form checkbox task in db error: ", error);
    }

    return {
      formCheckboxTask: data ? data[0] : null,
      formCheckboxTaskError: error as SupabaseError | null,
    };
  }
}
