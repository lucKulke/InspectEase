import { UUID } from "crypto";

export interface IFillableFormInsert {
  build_id: UUID;
}

export interface IFillableFormResponse extends IFillableFormInsert {
  id: UUID;
  created_at: Date | string;
}
