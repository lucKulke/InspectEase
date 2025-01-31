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
}

export interface IInspectableObjectProfileInsert {
  name: string;
  description: string;
}

// ---------------------------
