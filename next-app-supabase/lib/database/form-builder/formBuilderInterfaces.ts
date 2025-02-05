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
export interface IInspectableObjectProfilePropertyInsert {
  name: string;
  description: string;
  order_number: number;
  profile_id: UUID;
}

export interface IInspectableObjectProfilePropertyResponse {
  id: UUID;
  name: string;
  description: string;
  order_number: number;
  created_at: string;
}

// ---------------------------

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

export interface IInspectableObjectWithPropertiesAndProfileResponse
  extends IInspectableObjectResponse {
  inspectable_object_property: IInspectableObjectPropertyResponse[];
  inspectable_object_profile: IInspectableObjectProfileResponse;
}

export interface IInspectableObjectWithPropertiesResponse
  extends IInspectableObjectResponse {
  inspectable_object_property: IInspectableObjectPropertyResponse[];
}

export interface IInspectableObjectProfileWithProperties
  extends IInspectableObjectProfileResponse {
  inspectable_object_profile_property: IInspectableObjectProfilePropertyResponse[];
}
