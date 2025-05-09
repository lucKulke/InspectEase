import { SupabaseClient } from "@supabase/supabase-js";
import {
  IFormCheckboxGroupInsert,
  IFormCheckboxGroupResponse,
  IFormCheckboxInsert,
  IFormCheckboxResponse,
  IFormCheckboxTaskResponse,
  IFormTextInputFieldResponse,
  IInspectableObjectInspectionFormMainSectionInsert,
  IInspectableObjectInspectionFormMainSectionResponse,
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormPropertyResponse,
  IInspectableObjectInspectionFormSubSectionResponse,
  IInspectableObjectInspectionFormSubSectionWithData,
  IInspectableObjectProfileFormPropertyResponse,
  IInspectableObjectProfileFormTypePropertyInsert,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileInsert,
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectPropertyResponse,
  IInspectableObjectResponse,
  IStringExtractionTrainingExampleResponse,
  IStringExtractionTrainingResponse,
  ISubSectionCore,
} from "./formBuilderInterfaces";
import { SupabaseError } from "../../globalInterfaces";
import { UUID } from "crypto";
import { Example } from "@/app/(form-builder)/form-builder/inspectable-object-profiles/[profile_id]/string-extraction-training/[training_id]/ExtractionSection";

export class DBActionsFormBuilderUpdate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async updateInspectableObjectProfile(
    profileId: UUID,
    profile: IInspectableObjectProfileInsert
  ): Promise<{
    updatedInspectableObjectProfile: IInspectableObjectProfileResponse;
    updatedInspectableObjectProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .update(profile)
      .eq("id", profileId)
      .select();

    console.log("update inspectable object profiles in db:", data);
    if (error) {
      console.error("update inspectable object profiles in db error: ", error);
    }

    return {
      updatedInspectableObjectProfile: data ? data[0] : null,
      updatedInspectableObjectProfileError: error as SupabaseError | null,
    };
  }

  async updateInspectableObjectProfileObjProperty(
    propertys: IInspectableObjectProfileObjPropertyResponse[]
  ): Promise<{
    updatedInspectableObjectProfileObjPropertys: IInspectableObjectProfileObjPropertyResponse[];
    updatedInspectableObjectProfileObjPropertysError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_obj_property")
      .upsert(propertys)
      .select();

    console.log("update inspectable object profile obj propertys in db:", data);
    if (error) {
      console.error(
        "update inspectable object profile obj propertys in db error: ",
        error
      );
    }

    return {
      updatedInspectableObjectProfileObjPropertys: data ? data : [],
      updatedInspectableObjectProfileObjPropertysError:
        error as SupabaseError | null,
    };
  }

  async updateInspectableObjectProfileFormProperty(
    propertys: IInspectableObjectProfileFormPropertyResponse[]
  ): Promise<{
    updatedInspectableObjectProfileFormPropertys: IInspectableObjectProfileFormPropertyResponse[];
    updatedInspectableObjectProfileFormPropertysError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_property")
      .upsert(propertys)
      .select();

    console.log("update inspectable object profile obj propertys in db:", data);
    if (error) {
      console.error(
        "update inspectable object profile obj propertys in db error: ",
        error
      );
    }

    return {
      updatedInspectableObjectProfileFormPropertys: data ? data : [],
      updatedInspectableObjectProfileFormPropertysError:
        error as SupabaseError | null,
    };
  }

  async updateInspectableObjectProperty(
    propertyId: UUID,
    property: {}
  ): Promise<{
    updatedInspectableObjectProperty: IInspectableObjectPropertyResponse | null;
    updatedInspectableObjectPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_property")
      .update(property)
      .eq("id", propertyId)
      .select();

    console.log("update inspectable object property in db:", data);
    if (error) {
      console.error("update inspectable object property in db error: ", error);
    }

    return {
      updatedInspectableObjectProperty: data ? data[0] : null,
      updatedInspectableObjectPropertyError: error as SupabaseError | null,
    };
  }

  async updateInspectableObjectFormProperty(
    propertyId: UUID,
    property: {}
  ): Promise<{
    updatedInspectableObjectFormProperty: IInspectableObjectInspectionFormPropertyResponse | null;
    updatedInspectableObjectFormPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_property")
      .update(property)
      .eq("id", propertyId)
      .select();

    console.log("update inspectable object form property in db:", data);
    if (error) {
      console.error(
        "update inspectable object form property in db error: ",
        error
      );
    }

    return {
      updatedInspectableObjectFormProperty: data ? data[0] : null,
      updatedInspectableObjectFormPropertyError: error as SupabaseError | null,
    };
  }

  async updateInspectableObjectProfileFormTypeProps(
    formTypeProps: IInspectableObjectProfileFormTypePropertyResponse[]
  ): Promise<{
    updatedInspectableObjectProfileFormTypeProperty: IInspectableObjectPropertyResponse | null;
    updatedInspectableObjectProfileFormTypePropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type_property")
      .upsert(formTypeProps)
      .select();

    console.log(
      "update inspectable object profile form type props in db:",
      data
    );
    if (error) {
      console.error(
        "update inspectable object profile form type props in db error: ",
        error
      );
    }

    return {
      updatedInspectableObjectProfileFormTypeProperty: data ? data[0] : null,
      updatedInspectableObjectProfileFormTypePropertyError:
        error as SupabaseError | null,
    };
  }

  async updateInspectableObjectInspectionFormMainSections(
    mainSections: IInspectableObjectInspectionFormMainSectionResponse[]
  ): Promise<{
    updatedInspectableObjectInspectionFormMainSections: IInspectableObjectInspectionFormMainSectionResponse[];

    updatedInspectableObjectInspectionFormMainSectionsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_main_section")
      .upsert(mainSections)
      .select();

    console.log(
      "update inspectable object inspection form main sections in db:",
      data
    );
    if (error) {
      console.error(
        "update inspectable object inspection form main sections in db error: ",
        error
      );
    }

    return {
      updatedInspectableObjectInspectionFormMainSections: data ? data : [],
      updatedInspectableObjectInspectionFormMainSectionsError:
        error as SupabaseError | null,
    };
  }

  async updateInspectableObjectInspectionFormSubSections(
    subSections: ISubSectionCore[]
  ): Promise<{
    updatedInspectableObjectInspectionFormSubSections: IInspectableObjectInspectionFormSubSectionResponse[];

    updatedInspectableObjectInspectionFormSubSectionsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_sub_section")
      .upsert(subSections)
      .select();

    console.log(
      "update inspectable object inspection form sub sections in db:",
      data
    );
    if (error) {
      console.error(
        "update inspectable object inspection form sub sections in db error: ",
        error
      );
    }

    return {
      updatedInspectableObjectInspectionFormSubSections: data ? data : [],
      updatedInspectableObjectInspectionFormSubSectionsError:
        error as SupabaseError | null,
    };
  }

  async updateInspectableObjectInspectionFormSubSection(
    subSectionId: UUID,
    newName: string,
    newDescription: string
  ): Promise<{
    updatedInspectableObjectInspectionFormSubSection: IInspectableObjectInspectionFormSubSectionWithData | null;
    updatedInspectableObjectInspectionFormSubSectionError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_sub_section")
      .update({ name: newName, description: newDescription })
      .eq("id", subSectionId)
      .select(
        `*, form_checkbox_group(*, form_checkbox(*)), form_text_input_field(*)`
      );

    console.log(
      "update inspectable object inspection form sub section in db:",
      data
    );
    if (error) {
      console.error(
        "update inspectable object inspection form sub section in db error: ",
        error
      );
    }

    return {
      updatedInspectableObjectInspectionFormSubSection: data ? data[0] : null,
      updatedInspectableObjectInspectionFormSubSectionError:
        error as SupabaseError | null,
    };
  }

  async updateInspectableObjectInspectionFormMainSection(
    mainSectionId: UUID,
    newName: string,
    newDescription: string
  ): Promise<{
    updatedInspectableObjectInspectionFormMainSection: IInspectableObjectInspectionFormMainSectionResponse | null;

    updatedInspectableObjectInspectionFormMainSectionError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_main_section")
      .update({ name: newName, description: newDescription })
      .eq("id", mainSectionId)
      .select();

    console.log(
      "update inspectable object inspection form main section in db:",
      data
    );
    if (error) {
      console.error(
        "update inspectable object inspection form main section in db error: ",
        error
      );
    }

    return {
      updatedInspectableObjectInspectionFormMainSection: data ? data[0] : null,
      updatedInspectableObjectInspectionFormMainSectionError:
        error as SupabaseError | null,
    };
  }

  async updateFormCheckboxes(checkboxes: IFormCheckboxInsert[]): Promise<{
    updatedFormCheckboxes: IFormCheckboxResponse[];
    updatedFormCheckboxesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_checkbox")
      .upsert(checkboxes)
      .select();

    console.log("update form checkboxes in db:", data);
    if (error) {
      console.error("update form checkboxes in db error: ", error);
    }

    return {
      updatedFormCheckboxes: data ? data : [],
      updatedFormCheckboxesError: error as SupabaseError | null,
    };
  }

  async updateFormCheckboxTasks(
    checkboxTasks: IFormCheckboxTaskResponse[]
  ): Promise<{
    updatedFormCheckboxTasks: IFormCheckboxTaskResponse[];
    updatedFormCheckboxTasksError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_checkbox_task")
      .upsert(checkboxTasks)
      .select();

    console.log("update form checkbox tasks order number in db:", data);
    if (error) {
      console.error(
        "update form checkbox tasks order number in db error: ",
        error
      );
    }

    return {
      updatedFormCheckboxTasks: data ? data : [],
      updatedFormCheckboxTasksError: error as SupabaseError | null,
    };
  }

  async updateFormTextInputFields(
    textInputFields: IFormTextInputFieldResponse[]
  ): Promise<{
    updatedFormTextInputFields: IFormTextInputFieldResponse[];
    updatedFormTextInputFieldsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_text_input_field")
      .upsert(textInputFields)
      .select();

    console.log("update form text input field order number in db:", data);
    if (error) {
      console.error(
        "update form text input field order number in db error: ",
        error
      );
    }

    return {
      updatedFormTextInputFields: data ? data : [],
      updatedFormTextInputFieldsError: error as SupabaseError | null,
    };
  }

  async updateStringExtractionExamples(
    exampleData: {
      input: string;
      output: string;
    },
    exampleId: UUID
  ): Promise<{
    updatedStringExtractionExample:
      | IStringExtractionTrainingExampleResponse[]
      | null;
    updatedStringExtractionExampleError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("string_extraction_training_example")
      .update(exampleData)
      .eq("id", exampleId)
      .select();

    console.log("update string extraction example in db:", data);
    if (error) {
      console.error("update string extraction example in db error: ", error);
    }

    return {
      updatedStringExtractionExample: data ? data[0] : null,
      updatedStringExtractionExampleError: error as SupabaseError | null,
    };
  }
  async updateStringExtractionTrainingPrompt(
    prompt: string,
    trainingId: UUID
  ): Promise<{
    updatedStringExtractionTrainingPrompt: IStringExtractionTrainingResponse | null;
    updatedStringExtractionTrainingPromptError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("string_extraction_training")
      .update({ prompt: prompt })
      .eq("id", trainingId)
      .select();

    console.log("update string extraction training prompt in db:", data);
    if (error) {
      console.error(
        "update string extraction training prompt in db error: ",
        error
      );
    }

    return {
      updatedStringExtractionTrainingPrompt: data ? data[0] : null,
      updatedStringExtractionTrainingPromptError: error as SupabaseError | null,
    };
  }

  async updateTextInputFieldTraining(
    field: UUID,
    trainingId: UUID
  ): Promise<{
    updatedFormTextInputField: IFormTextInputFieldResponse | null;
    updatedFormTextInputFieldError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_text_input_field")
      .update({ training_id: trainingId })
      .eq("id", field)
      .select();

    console.log("create new string extraction training examples in db:", data);
    if (error) {
      console.error(
        "create new string extraction training examples in db error: ",
        error
      );
    }

    return {
      updatedFormTextInputField: data ? data[0] : null,
      updatedFormTextInputFieldError: error as SupabaseError | null,
    };
  }

  async updateCheckboxGroupRules(
    groupId: UUID,
    newRules: UUID[] | null
  ): Promise<{
    updatedCheckboxGroup: IFormCheckboxGroupResponse | null;
    updatedCheckboxGroupError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form_checkbox_group")
      .update({ checkboxes_selected_together: newRules })
      .eq("id", groupId)
      .select()
      .single();

    console.log("updated checkbox group rules in db:", data);
    if (error) {
      console.error("updated checkbox group rules in db error: ", error);
    }

    return {
      updatedCheckboxGroup: data,
      updatedCheckboxGroupError: error as SupabaseError | null,
    };
  }
}
