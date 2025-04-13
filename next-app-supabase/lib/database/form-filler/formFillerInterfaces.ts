import { UUID } from "crypto";

export interface IFillableFormInsert {
  build_id: UUID;
  identifier_string: string;
}

export interface IFillableFormResponse extends IFillableFormInsert {
  id: UUID;
  created_at: Date | string;
  in_progress: boolean;
}

export interface ISubSectionInsert {
  id: UUID;
  name: string;
  description: string;
  order_number: number;
  main_section_id: UUID;
}

export interface ISubSectionResponse extends ISubSectionInsert {
  created_at: Date | string;
}

export interface IMainSectionInsert {
  id: UUID;
  name: string;
  description: string;
  order_number: number;
  form_id: UUID;
}

export interface IMainSectionResponse extends IMainSectionInsert {
  created_at: Date | string;
}

export interface ICheckboxGroupInsert {
  id: UUID;
  name: string;
  sub_section_id: UUID;
}

export interface ICheckboxGroupResponse extends ICheckboxGroupInsert {
  created_at: Date | string;
}

export interface ITaskInsert {
  id: UUID;
  description: string;
  group_id: UUID;
  order_number: number;
}

export interface ITaskResponse extends ITaskInsert {
  created_at: Date | string;
}

export interface IMainCheckboxInsert {
  id: UUID;
  group_id: UUID;
  order_number: number;
  label: string;
}

export interface IMainCheckboxResponse extends IMainCheckboxInsert {
  created_at: Date | string;
}

export interface ISubCheckboxInsert {
  id: UUID;
  main_checkbox_id: UUID;
  task_id: UUID;
}

export interface ISubCheckboxResponse extends ISubCheckboxInsert {
  created_at: Date | string;
}

export interface ITextInputInsert {
  id: UUID;
  sub_section_id: UUID;
  placeholder_text: string | null;
  training_id: UUID | null;
}

export interface ITextInputResponse extends ITextInputInsert {
  created_at: Date | string;
}
