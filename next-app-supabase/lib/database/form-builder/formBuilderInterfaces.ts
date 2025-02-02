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
