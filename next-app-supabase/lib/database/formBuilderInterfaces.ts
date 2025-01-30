import { UUID } from "crypto";

type AllowedTypes = "vehicle"; // add with | "Bridge"

export interface IInspectableObjectsResponse {
  id: UUID;
  created_at: string | Date;
  updated_at: string | Date;
  type: AllowedTypes;
}

export interface IInspectableObjectsInsert {}
