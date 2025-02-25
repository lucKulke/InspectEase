import { IconType } from "@/lib/availableIcons";
import { UUID } from "crypto";

type AllowedTypes = "vehicle"; // add with | "Bridge"

// --- Inspectable object ---
export interface IInspectableObjectResponse {
  id: UUID;
  created_at: string | Date;
  updated_at: string | Date;
  type: AllowedTypes;
}

export interface IInspectableObjectInsert {}
// ---------------------------

// Inspectable object profile
export interface IInspectableObjectProfileResponse {
  id: UUID;
  created_at: string | Date;
  updated_at: string | Date;
  name: string;
  description: string;
  object_count: string;
  icon_key: IconType;
}

export interface IInspectableObjectProfileInsert {
  name: string;
  description: string;
  icon_key: IconType;
}

// ---------------------------

// Inspectable object profile property
export interface IInspectableObjectProfileObjPropertyInsert {
  name: string;
  description: string;
  order_number: number;
  profile_id: UUID;
}

export interface IInspectableObjectProfileObjPropertyResponse {
  id: UUID;
  name: string;
  description: string;
  order_number: number;
  created_at: string;
}

// ---------------------------
export interface IInspectableObjectProfileFormPropertyInsert {
  name: string;
  description: string;
  order_number: number;
  profile_id: UUID;
}

export interface IInspectableObjectProfileFormPropertyResponse {
  id: UUID;
  name: string;
  description: string;
  order_number: number;
  created_at: string;
}

// Inspectable object propertys

export interface IInspectableObjectPropertyInsert {
  object_id: UUID;
  profile_property_id: UUID;
  value: string;
}

export interface IInspectableObjectPropertyResponse
  extends IInspectableObjectPropertyInsert {
  id: UUID;
  created_at: Date | string;
}

// Inspectable object profile form type property

export interface IInspectableObjectProfileFormTypePropertyInsert {
  name: string;
  description: string;
  order_number: number;
  form_type_id: UUID;
}

export interface IInspectableObjectProfileFormTypePropertyResponse
  extends IInspectableObjectProfileFormTypePropertyInsert {
  id: UUID;
  created_at: Date | string;
}

// Inspectable object profile form type

export interface IInspectableObjectProfileFormTypeInsert {
  name: string;
  description: string;
  profile_id: UUID;
}

export interface IInspectableObjectProfileFormTypeResponse
  extends IInspectableObjectProfileFormTypeInsert {
  id: UUID;
  created_at: Date | string;
}

// Inspectable object

export interface IInspectableObjectInsert {
  profile_id: UUID;
}

export interface IInspectableObjectResponse extends IInspectableObjectInsert {
  id: UUID;
  created_at: Date | string;
  updated_at: string | Date;
  profile_id: UUID;
}

// -------------------

// inspection form

export interface IInspectableObjectInspectionFormInsert {
  object_id: UUID;
  form_type_id: UUID;
}

export interface IInspectableObjectInspectionFormResponse
  extends IInspectableObjectInspectionFormInsert {
  id: UUID;
  created_at: Date | string;
  updated_at: Date | string;
  document_id: UUID;
}

// ---------------

// inspection form property
export interface IInspectableObjectInspectionFormPropertyInsert {
  form_type_prop_id: UUID;
  inspection_form_id: UUID;
  value: string;
}

export interface IInspectableObjectInspectionFormPropertyResponse
  extends IInspectableObjectInspectionFormPropertyInsert {
  id: UUID;
  created_at: Date | string;
}

// -----------------

// inspection form annotations

export interface IInspectableObjectInspectionFormAnnotationInsert {
  inspection_form_id: UUID;
  page: number;
  type: string;
  content: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface IInspectableObjectInspectionFormAnnotationResponse
  extends IInspectableObjectInspectionFormAnnotationInsert {
  id: UUID;
  created_at: Date | string;
}

// --------------------

// inspection form main sections

export interface IInspectableObjectInspectionFormMainSectionInsert {
  name: string;
  description: string;
  order_number: number;
  form_id: UUID;
}

export interface IInspectableObjectInspectionFormMainSectionResponse
  extends IInspectableObjectInspectionFormMainSectionInsert {
  id: UUID;
  created_at: Date | string;
}

// ---------------------------

// inspection form sub sections

export interface IInspectableObjectInspectionFormSubSectionInsert {
  name: string;
  description: string;
  order_number: number;
  main_section_id: UUID;
}

// test ####
export interface IMultipleChoiceGroup {
  id: UUID;
  created_at: Date | string;
  sub_section_id: UUID;
  multiple_choice_field: IMultipleChoiceField[];
}

export interface IMultipleChoiceField {
  id: UUID;
  created_at: Date | string;
  group_id: UUID;
}

export interface ISingleChoiceGroup {
  id: UUID;
  created_at: Date | string;
  sub_section_id: UUID;
  single_choice_field: ISingleChoiceField[];
}

export interface ISingleChoiceField {
  id: UUID;
  created_at: Date | string;
  group_id: UUID;
}

export interface ITextInputGroup {
  id: UUID;
  created_at: Date | string;
  sub_section_id: UUID;
  text_input_field: ITextInputField[];
}

export interface ITextInputField {
  id: UUID;
  created_at: Date | string;
  group_id: UUID;
}

//

export interface IInspectableObjectInspectionFormSubSectionResponse
  extends IInspectableObjectInspectionFormSubSectionInsert {
  id: UUID;
  created_at: Date | string;
  multiple_choice_group: IMultipleChoiceGroup[];
  single_choice_group: ISingleChoiceGroup[];
  text_input_group: ITextInputGroup[];
}

export interface ISubSectionCore
  extends IInspectableObjectInspectionFormSubSectionInsert {
  id: UUID;
  created_at: Date | string;
}

// ---------------------------

// inspection form multiple choice field
export interface IInspectableObjectInspectionFormMultipleChoiceFieldInsert {
  name: string;
  description: string;
  order_number: number;
  group_id: UUID;
}

export interface IInspectableObjectInspectionFormMultipleChoiceFieldResponse
  extends IInspectableObjectInspectionFormMultipleChoiceFieldInsert {
  id: UUID;
  created_at: Date | string;
}

// -------------------------

// inspection form multiple choice group
export interface IInspectableObjectInspectionFormMultipleChoiceGroupInsert {
  sub_section_id: UUID;
}

export interface IInspectableObjectInspectionFormMultipleChoiceGroupResponse
  extends IInspectableObjectInspectionFormMultipleChoiceGroupInsert {
  id: UUID;
  created_at: Date | string;
}

// -------------------------

// inspection form single choice field
export interface IInspectableObjectInspectionFormSingleChoiceFieldInsert {
  name: string;
  description: string;
  order_number: number;
  group_id: UUID;
}

export interface IInspectableObjectInspectionFormSingleChoiceFieldResponse
  extends IInspectableObjectInspectionFormSingleChoiceFieldInsert {
  id: UUID;
  created_at: Date | string;
}

// -------------------------

// inspection form single choice group
export interface IInspectableObjectInspectionFormSingleChoiceGroupInsert {
  sub_section_id: UUID;
}

export interface IInspectableObjectInspectionFormSingleChoiceGroupResponse
  extends IInspectableObjectInspectionFormSingleChoiceGroupInsert {
  id: UUID;
  created_at: Date | string;
}

// -------------------------

// inspection form text input field
export interface IInspectableObjectInspectionFormTextInputFieldInsert {
  name: string;
  description: string;
  order_number: number;
  group_id: UUID;
  nullable: boolean;
  training_id: UUID;
}

export interface IInspectableObjectInspectionFormTextInputFieldResponse
  extends IInspectableObjectInspectionFormTextInputFieldInsert {
  id: UUID;
  created_at: Date | string;
}

// -------------------------

// inspection form text input group
export interface IInspectableObjectInspectionFormTextInputGroupInsert {
  sub_section_id: UUID;
}

export interface IInspectableObjectInspectionFormTextInputGroupResponse
  extends IInspectableObjectInspectionFormTextInputGroupInsert {
  id: UUID;
  created_at: Date | string;
}

// -------------------------

export interface IInspectableObjectWithPropertiesAndProfileResponse
  extends IInspectableObjectResponse {
  inspectable_object_property: IInspectableObjectPropertyResponse[];
  inspectable_object_profile: IInspectableObjectProfileResponse;
}

export interface IInspectableObjectWithPropertiesResponse
  extends IInspectableObjectResponse {
  inspectable_object_property: IInspectableObjectPropertyResponse[];
}

export interface IInspectableObjectProfileWithObjProperties
  extends IInspectableObjectProfileResponse {
  inspectable_object_profile_obj_property: IInspectableObjectProfileObjPropertyResponse[];
}

export interface IInspectableObjectProfileWithFormProperties
  extends IInspectableObjectProfileResponse {
  inspectable_object_profile_form_property: IInspectableObjectProfileFormPropertyResponse[];
}

export interface IInspectableObjectProfileFormTypesWithProperties
  extends IInspectableObjectProfileFormTypeResponse {
  inspectable_object_profile_form_type_property: IInspectableObjectProfileFormTypePropertyResponse[];
}

export interface IInspectableObjectProfileWitFormTypes
  extends IInspectableObjectProfileResponse {
  inspectable_object_profile_form_type: IInspectableObjectProfileFormTypeResponse[];
}

export interface IInspectableObjectInspectionFormWithProps
  extends IInspectableObjectInspectionFormResponse {
  inspectable_object_inspection_form_property: IInspectableObjectInspectionFormPropertyResponse[];
}

export interface IInspectableObjectProfileFormTypeWithProps
  extends IInspectableObjectProfileFormTypeResponse {
  inspectable_object_profile_form_type_property: IInspectableObjectProfileFormTypePropertyResponse[];
}

export interface IInspectableObjectInspectionFormMainSectionWithSubSection
  extends IInspectableObjectInspectionFormMainSectionResponse {
  inspectable_object_inspection_form_sub_section: IInspectableObjectInspectionFormSubSectionResponse[];
}
