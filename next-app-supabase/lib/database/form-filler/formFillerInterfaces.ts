import { UUID } from "crypto";

export interface IFillableFormInsert {
  build_id: UUID;
  identifier_string: string;
  object_profile_name: string;
  object_profile_icon: string;
  object_props: Record<string, string>;
  form_type: string;
  form_props: Record<string, string>;
  document_id: UUID;
}

export interface IFillableFormResponse extends IFillableFormInsert {
  id: UUID;
  created_at: Date | string;
  in_progress: boolean;
  updated_at: Date | string;
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
  checkboxes_selected_together: string[] | null;
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
  prio_number: number;
  annotation_id: UUID | null;
}

export interface IMainCheckboxResponse extends IMainCheckboxInsert {
  created_at: Date | string;
  checked: boolean;
}

export interface ISubCheckboxInsert {
  id: UUID;
  main_checkbox_id: UUID;
  task_id: UUID;
}

export interface ISubCheckboxResponse extends ISubCheckboxInsert {
  created_at: Date | string;
  checked: boolean;
}

export interface ITextInputInsert {
  id: UUID;
  sub_section_id: UUID;
  placeholder_text: string | null;
  training_id: UUID | null;
  label: string;
  order_number: number;
  annotation_id: UUID | null;
}

export interface ITextInputResponse extends ITextInputInsert {
  created_at: Date | string;
  value: string | null;
}

// test

export interface ISubCheckboxData extends ISubCheckboxResponse {}

export interface IMainCheckboxData extends IMainCheckboxResponse {
  sub_checkbox: ISubCheckboxData[];
}

export interface ITaskData extends ITaskResponse {}

export interface ICheckboxGroupData extends ICheckboxGroupResponse {
  main_checkbox: IMainCheckboxData[];
  task: ITaskData[];
}

export interface ITextInputData extends ITextInputResponse {}

export interface ISubSectionData extends ISubSectionResponse {
  checkbox_group: ICheckboxGroupData[];
  text_input: ITextInputData[];
}

export interface IMainSectionData extends IMainSectionResponse {
  sub_section: ISubSectionData[];
}

export interface IFormData extends IFillableFormResponse {
  main_section: IMainSectionData[];
}

interface IText {
  value: string | null;
}

interface ISubCheckbox {
  checked: boolean;
}
interface IMainCheckbox {
  checked: boolean;
  sub_checkbox: ISubCheckbox[];
}
interface IGroup {
  main_checkbox: IMainCheckbox[];
}

interface ISub {
  text_input: IText[];
  checkbox_group: IGroup[];
}

interface IMain {
  sub_section: ISub[];
}

export interface IFillableFormPlusFillableFields extends IFillableFormResponse {
  main_section: IMain[];
}
