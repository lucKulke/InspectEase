import { UUID } from "crypto";

export interface IFillableFormInsert {
  build_id: UUID;
}

export interface IFillableFormResponse extends IFillableFormInsert {
  id: UUID;
  created_at: Date | string;
  in_progress: boolean;
}

export interface IFillableMainCheckboxInsert {
  id: UUID;
  fillable_form_id: UUID;
  checkbox_build_id: UUID;
}

export interface IFillableMainCheckboxResponse
  extends IFillableMainCheckboxInsert {
  created_at: Date | string;
  checked: boolean;
}

export interface IFillableCheckboxInsert {
  build_task_id: UUID;
  main_checkbox_id: UUID;
}

export interface IFillableCheckboxResponse extends IFillableCheckboxInsert {
  id: UUID;
  created_at: Date | string;
  checked: boolean;
}

export interface IFillableTextInputFieldInsert {
  text_input_build_id: UUID;
  fillable_form_id: UUID;
}

export interface IFillableTextInputFieldResponse
  extends IFillableCheckboxInsert {
  id: UUID;
  created_at: Date | string;
  value: string;
}

interface ICheckbox {
  id: UUID;
}

interface ICheckboxTask {
  id: UUID;
}

interface ITextInputField {
  id: UUID;
}

interface ICheckboxGroup {
  form_checkbox: ICheckbox[];
  form_checkbox_task: ICheckboxTask[];
}

interface ISubSection {
  form_text_input_field: ITextInputField[];
  form_checkbox_group: ICheckboxGroup[];
}

interface IMainSection {
  inspectable_object_inspection_form_sub_section: ISubSection[];
}

export interface IFormData {
  inspectable_object_inspection_form_main_section: IMainSection[];
}

export interface IMainCheckboxWithSubCheckboxData
  extends IFillableMainCheckboxResponse {
  checkbox: IFillableCheckboxResponse[];
}
