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
