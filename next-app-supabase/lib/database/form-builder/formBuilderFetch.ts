import { SupabaseClient } from "@supabase/supabase-js";
import {
  IInspectableObjectInspectionFormAnnotationResponse,
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormMainSectionWithSubSectionData,
  IInspectableObjectInspectionFormResponse,
  IInspectableObjectInspectionFormWithProps,
  IInspectableObjectProfileFormPropertyResponse,
  IInspectableObjectProfileFormTypeInsert,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileFormTypeWithProps,
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectProfileWitFormTypes,
  IInspectableObjectProfileWithFormProperties,
  IInspectableObjectProfileWithObjProperties,
  IInspectableObjectPropertyResponse,
  IInspectableObjectResponse,
  IInspectableObjectWithPropertiesAndProfileResponse,
  IInspectableObjectWithPropertiesResponse,
  IStringExtractionTrainingExampleResponse,
  IStringExtractionTrainingResponse,
  IStringExtractionTrainingWithExamplesResponse,
} from "./formBuilderInterfaces";
import { SupabaseError } from "../../globalInterfaces";
import { UUID } from "crypto";

export class DBActionsFormBuilderFetch {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async fetchInspectableObjects(userId: string): Promise<{
    inspectableObjects: IInspectableObjectResponse[];
    inspectableObjectsError: SupabaseError;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .select("*");

    console.log("fetch inspectable objects in db:", data);
    if (error) {
      console.error("fetch inspectable objects in db error: ", error);
    }

    return {
      inspectableObjects: data ? data : [],
      inspectableObjectsError: error as SupabaseError,
    };
  }

  async fetchInspectableObject(objectId: UUID): Promise<{
    inspectableObject: IInspectableObjectResponse | null;
    inspectableObjectError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .select("*")
      .eq("id", objectId);

    console.log("fetch inspectable object in db:", data);
    if (error) {
      console.error("fetch inspectable object in db error: ", error);
    }

    return {
      inspectableObject: data ? data[0] : null,
      inspectableObjectError: error ? (error as SupabaseError) : null,
    };
  }

  async fetchInspectableObjectPropertys(objectId: UUID): Promise<{
    inspectableObjectPropertys: IInspectableObjectPropertyResponse[];
    inspectableObjectPropertysError: SupabaseError;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_property")
      .select("*")
      .eq("object_id", objectId);

    console.log("fetch inspectable objects in db:", data);
    if (error) {
      console.error("fetch inspectable objects in db error: ", error);
    }

    return {
      inspectableObjectPropertys: data ? data : [],
      inspectableObjectPropertysError: error as SupabaseError,
    };
  }

  async fetchInspectableObjectWithPropertiesAndProfile(
    objectId: UUID
  ): Promise<{
    inspectableObjectWithPropertiesAndProfile: IInspectableObjectWithPropertiesAndProfileResponse | null;
    inspectableObjectWithPropertiesAndProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .select(
        `
    *, 
    inspectable_object_property(*), 
    inspectable_object_profile!profile_id(*)
    
  `
      )
      .eq("id", objectId)
      .single();

    console.log(
      "fetch inspectable object with properties and profile test in db:",
      data
    );
    if (error) {
      console.log(
        "fetch inspectable  object with properties and profile in db error: ",
        error
      );
    }

    return {
      inspectableObjectWithPropertiesAndProfile: data,
      inspectableObjectWithPropertiesAndProfileError: error,
    };
  }

  async fetchInspectableObjectsByProfileIdWithProperties(
    profileId: UUID
  ): Promise<{
    inspectableObjectsWitProps: IInspectableObjectWithPropertiesResponse[];
    inspectableObjectsWitPropsError: SupabaseError;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .select(
        `
    *, 
    inspectable_object_property(*)
    
  `
      )
      .eq("profile_id", profileId);

    console.log("fetch inspectable objects with its properties in db:", data);
    if (error) {
      console.error(
        "fetch inspectable objects with its properties in db error: ",
        error
      );
    }

    return {
      inspectableObjectsWitProps: data ? data : [],
      inspectableObjectsWitPropsError: error as SupabaseError,
    };
  }

  async fetchAllInspectableObjectsWithProperties(userId: UUID): Promise<{
    inspectableObjectsWithProps: IInspectableObjectWithPropertiesResponse[];
    inspectableObjectsWithPropsError: SupabaseError;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .select(
        `
    *, 
    inspectable_object_property(*)
    
  `
      );

    console.log(
      "fetch all inspectable objects with its properties in db:",
      data
    );
    if (error) {
      console.error(
        "fetch inspectable all objects with its properties in db error: ",
        error
      );
    }

    return {
      inspectableObjectsWithProps: data ? data : [],
      inspectableObjectsWithPropsError: error as SupabaseError,
    };
  }

  async fetchInspectableObjectsByProfileId(profileId: UUID): Promise<{
    inspectableObjects: IInspectableObjectResponse[];
    inspectableObjectsError: SupabaseError;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .select("*")
      .eq("profile_id", profileId);

    console.log("fetch inspectable objects in db:", data);
    if (error) {
      console.error("fetch inspectable objects in db error: ", error);
    }

    return {
      inspectableObjects: data ? data : [],
      inspectableObjectsError: error as SupabaseError,
    };
  }

  async fetchInspectableObjectProfiles(): Promise<{
    inspectableObjectProfiles: IInspectableObjectProfileResponse[];
    inspectableObjectProfilesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .select("*");

    console.log("fetch inspectable object profiles in db:", data);
    if (error) {
      console.error("fetch inspectable object profiles in db error: ", error);
    }

    return {
      inspectableObjectProfiles: data ? data : [],
      inspectableObjectProfilesError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectProfile(profileId: UUID): Promise<{
    inspectableObjectProfile: IInspectableObjectProfileResponse | null;
    inspectableObjectProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .select("*")
      .eq("id", profileId);

    console.log("fetch inspectable object profile in db:", data);
    if (error) {
      console.error("fetch inspectable object profile in db error: ", error);
    }

    return {
      inspectableObjectProfile: data ? data[0] : null,
      inspectableObjectProfileError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectProfileObjPropertys(profileId: UUID): Promise<{
    inspectableObjectProfilePropertys: IInspectableObjectProfileObjPropertyResponse[];
    inspectableObjectProfilePropertysError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_obj_property")
      .select("*")
      .eq("profile_id", profileId);

    console.log("fetch inspectable object profile in db:", data);
    if (error) {
      console.log("fetch inspectable object profile in db error: ", error);
    }

    return {
      inspectableObjectProfilePropertys: data ? data : [],
      inspectableObjectProfilePropertysError: error as SupabaseError | null,
    };
  }

  async fetchAllInspectableObjectProfileObjPropertys(userId: UUID): Promise<{
    inspectableObjectProfilePropertys: IInspectableObjectProfileObjPropertyResponse[];
    inspectableObjectProfilePropertysError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_obj_property")
      .select("*");

    console.log("fetch all inspectable object profile in db:", data);
    if (error) {
      console.log("fetch all inspectable object profile in db error: ", error);
    }

    return {
      inspectableObjectProfilePropertys: data ? data : [],
      inspectableObjectProfilePropertysError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectProfileWithObjProperties(
    profileId: UUID
  ): Promise<{
    inspectableObjectProfileWithObjProps: IInspectableObjectProfileWithObjProperties | null;
    inspectableObjectProfileWithObjPropsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .select(
        `
        *, 
        inspectable_object_profile_obj_property(*)
        
      `
      )
      .eq("id", profileId);

    console.log(
      "fetch inspectable object profile with obj properties in db:",
      data
    );
    if (error) {
      console.error(
        "fetch inspectable object profile with obj properties in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileWithObjProps: data ? data[0] : null,
      inspectableObjectProfileWithObjPropsError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectProfileWitFormTypes(profileId: UUID): Promise<{
    inspectableObjectProfileWithFormTypes: IInspectableObjectProfileWitFormTypes | null;
    inspectableObjectProfileWithFormTypesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .select(
        `
        *,
        inspectable_object_profile_form_type(*)

      `
      )
      .eq("id", profileId);

    console.log(
      "fetch inspectable object profile with form types in db:",
      data
    );
    if (error) {
      console.error(
        "fetch inspectable object profile with form types in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileWithFormTypes: data ? data[0] : null,
      inspectableObjectProfileWithFormTypesError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectProfileFormTypes(profileId: UUID): Promise<{
    inspectableObjectProfileFormTypes: IInspectableObjectProfileFormTypeResponse[];

    inspectableObjectProfileFormTypesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type")
      .select("*")
      .eq("profile_id", profileId);

    console.log("fetch inspectable object profile form types in db:", data);
    if (error) {
      console.error(
        "fetch inspectable object profile form types in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileFormTypes: data ? data : [],
      inspectableObjectProfileFormTypesError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectProfileFormTypeWithProps(
    formTypeId: UUID
  ): Promise<{
    inspectableObjectProfileFormTypeWithProps: IInspectableObjectProfileFormTypeWithProps | null;
    inspectableObjectProfileFormTypeWithPropsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type")
      .select(
        `
        *,
        inspectable_object_profile_form_type_property(*)
        `
      )
      .eq("id", formTypeId)
      .single();

    console.log("fetch inspectable object profile form type in db:", data);
    if (error) {
      console.error(
        "fetch inspectable object profile form type in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileFormTypeWithProps: data,
      inspectableObjectProfileFormTypeWithPropsError:
        error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectProfileFormTypeProps(formTypeId: UUID): Promise<{
    inspectableObjectProfileFormTypeProps:
      | IInspectableObjectProfileFormTypePropertyResponse[]
      | null;
    inspectableObjectProfileFormTypePropsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type_property")
      .select("*")
      .eq("form_type_id", formTypeId);

    console.log(
      "fetch inspectable object profile form type props in db:",
      data
    );
    if (error) {
      console.error(
        "fetch inspectable object profile form type props in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileFormTypeProps: data ? data : [],
      inspectableObjectProfileFormTypePropsError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectInspectionForms(objectId: UUID): Promise<{
    inspectableObjectInspectionForms: IInspectableObjectInspectionFormResponse[];
    inspectableObjectInspectionFormsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form")
      .select("*")
      .eq("object_id", objectId);

    console.log("fetch inspectable object inspection forms in db:", data);
    if (error) {
      console.error(
        "fetch inspectable object inspection forms in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionForms: data ? data : [],
      inspectableObjectInspectionFormsError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectInspectionForm(formId: UUID): Promise<{
    inspectableObjectInspectionForm: IInspectableObjectInspectionFormResponse;
    inspectableObjectInspectionFormError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form")
      .select("*")
      .eq("id", formId);

    console.log("fetch inspectable object inspection form in db:", data);
    if (error) {
      console.error(
        "fetch inspectable object inspection form in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionForm: data ? data[0] : null,
      inspectableObjectInspectionFormError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectInspectionFormWithProps(formId: UUID): Promise<{
    inspectableObjectInspectionFormWithProps: IInspectableObjectInspectionFormWithProps | null;
    inspectableObjectInspectionFormWithPropsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form")
      .select(
        `
        *,
        inspectable_object_inspection_form_property(*)
      `
      )
      .eq("id", formId)
      .single();

    console.log(
      "fetch inspectable object inspection form with props in db:",
      data
    );
    if (error) {
      console.error(
        "fetch inspectable object inspection form with props in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionFormWithProps: data,
      inspectableObjectInspectionFormWithPropsError:
        error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectInspectionFormAnnotations(formId: UUID): Promise<{
    inspectableObjectInspectionFormAnnotations: IInspectableObjectInspectionFormAnnotationResponse[];
    inspectableObjectInspectionFormAnnotationsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_annotation")
      .select()
      .eq("inspection_form_id", formId);

    console.log(
      "fetch inspectable object inspection form annotations in db:",
      data
    );
    if (error) {
      console.error(
        "fetch inspectable object inspection form annotations in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionFormAnnotations: data ? data : [],
      inspectableObjectInspectionFormAnnotationsError:
        error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectInspectionFormsWithProps(
    objectId: UUID
  ): Promise<{
    inspectableObjectInspectionForms: IInspectableObjectInspectionFormWithProps[];
    inspectableObjectInspectionFormsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form")
      .select(
        `
        *,
        inspectable_object_inspection_form_property(*)

      `
      )
      .eq("object_id", objectId);

    console.log(
      "fetch inspectable object inspection forms with props in db:",
      data
    );
    if (error) {
      console.error(
        "fetch inspectable object inspection forms with props in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionForms: data ? data : [],
      inspectableObjectInspectionFormsError: error as SupabaseError | null,
    };
  }

  async fetchAllInspectableObjectInspectionFormsWithProps(
    userId: UUID
  ): Promise<{
    inspectableObjectInspectionForms: IInspectableObjectInspectionFormWithProps[];
    inspectableObjectInspectionFormsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form")
      .select(
        `
        *,
        inspectable_object_inspection_form_property(*)

      `
      );

    console.log(
      "fetch all inspectable object inspection forms with props in db:",
      data
    );
    if (error) {
      console.error(
        "fetch all inspectable object inspection forms with props in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionForms: data ? data : [],
      inspectableObjectInspectionFormsError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectProfileFormTypesWithProps(
    profileId: UUID
  ): Promise<{
    inspectableObjectProfileFormTypesWithProps: IInspectableObjectProfileFormTypeWithProps[];

    inspectableObjectProfileFormTypesWithPropsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type")
      .select(
        `
        *,
        inspectable_object_profile_form_type_property(*)
        `
      )
      .eq("profile_id", profileId);

    console.log(
      "fetch inspectable object profile form types with props in db tessssset:",
      data
    );
    if (error) {
      console.error(
        "fetch inspectable object profile form types with props in db error tessssst: ",
        error
      );
    }

    return {
      inspectableObjectProfileFormTypesWithProps: data ? data : [],
      inspectableObjectProfileFormTypesWithPropsError:
        error as SupabaseError | null,
    };
  }

  async fetchAllInspectableObjectProfileFormTypesWithProps(
    userId: UUID
  ): Promise<{
    inspectableObjectProfileFormTypesWithProps: IInspectableObjectProfileFormTypeWithProps[];

    inspectableObjectProfileFormTypesWithPropsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type")
      .select(
        `
        *,
        inspectable_object_profile_form_type_property(*)
        `
      );

    console.log(
      "fetch all inspectable object profile form types with props in db tessssset:",
      data
    );
    if (error) {
      console.error(
        "fetch all inspectable object profile form types with props in db error tessssst: ",
        error
      );
    }

    return {
      inspectableObjectProfileFormTypesWithProps: data ? data : [],
      inspectableObjectProfileFormTypesWithPropsError:
        error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectInspectionFormMainSectionsWithSubSections(
    formId: UUID
  ): Promise<{
    inspectableObjectInspectionFormMainSectionsWithSubSectionData: IInspectableObjectInspectionFormMainSectionWithSubSectionData[];

    inspectableObjectInspectionFormMainSectionsWithSubSectionDataError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form_main_section")
      .select(
        `
        *,
        inspectable_object_inspection_form_sub_section(*, form_checkbox_group(*, form_checkbox_task(*), form_checkbox(*)), form_text_input_field(*))
        `
      )
      .eq("form_id", formId);

    console.log(
      "fetch inspectable object inspection form main sections with sub sections in db:",
      data
    );
    if (error) {
      console.error(
        "fetch inspectable object inspection form main sections with sub sections in db error: ",
        error
      );
    }

    return {
      inspectableObjectInspectionFormMainSectionsWithSubSectionData: data
        ? data
        : [],
      inspectableObjectInspectionFormMainSectionsWithSubSectionDataError:
        error as SupabaseError | null,
    };
  }

  async fetchStringExtractionTrainings(profileId: UUID): Promise<{
    stringExtractionTrainings: IStringExtractionTrainingResponse[] | null;

    stringExtractionTrainingsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("string_extraction_training")
      .select()
      .eq("profile_id", profileId);

    console.log("fetch string extraction trainings in db:", data);
    if (error) {
      console.error("fetch string extraction trainings in db error: ", error);
    }

    return {
      stringExtractionTrainings: data,
      stringExtractionTrainingsError: error as SupabaseError | null,
    };
  }

  async fetchStringExtractionTraining(trainingId: UUID): Promise<{
    stringExtractionTraining: IStringExtractionTrainingResponse | null;

    stringExtractionTrainingError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("string_extraction_training")
      .select()
      .eq("id", trainingId);

    console.log("fetch string extraction training in db:", data);
    if (error) {
      console.error("fetch string extraction training in db error: ", error);
    }

    return {
      stringExtractionTraining: data ? data[0] : null,
      stringExtractionTrainingError: error as SupabaseError | null,
    };
  }

  async fetchStringExtractionTrainingWithExamples(trainingId: UUID): Promise<{
    stringExtractionTrainingWithExamples: IStringExtractionTrainingWithExamplesResponse | null;

    stringExtractionTrainingWithExamplesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("string_extraction_training")
      .select(`*, string_extraction_training_example(*)`)
      .eq("id", trainingId)
      .single();

    console.log("fetch string extraction training with examples in db:", data);
    if (error) {
      console.error(
        "fetch string extraction training with examples in db error: ",
        error
      );
    }

    return {
      stringExtractionTrainingWithExamples: data,
      stringExtractionTrainingWithExamplesError: error as SupabaseError | null,
    };
  }

  async fetchStringExtractionTrainingExamples(trainingId: UUID): Promise<{
    stringExtractionTrainingExamples:
      | IStringExtractionTrainingExampleResponse[]
      | null;

    stringExtractionTrainingExamplesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("string_extraction_training_example")
      .select()
      .eq("training_id", trainingId);

    console.log("fetch string extraction training examples in db:", data);
    if (error) {
      console.error(
        "fetch string extraction training examples in db error: ",
        error
      );
    }

    return {
      stringExtractionTrainingExamples: data,
      stringExtractionTrainingExamplesError: error as SupabaseError | null,
    };
  }
}
