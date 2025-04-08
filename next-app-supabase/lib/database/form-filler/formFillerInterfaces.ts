import { UUID } from "crypto";

export interface IFillableFormInsert {
  build_id: UUID;
}

export interface IFillableFormResponse extends IFillableFormInsert {
  id: UUID;
  created_at: Date | string;
  in_progress: boolean;
}

export interface IFillableCheckboxInsert {
  checkbox_build_id: UUID;
  fillable_form_id: UUID;
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

interface ITextInputField {
  id: UUID;
}

interface ICheckboxGroup {
  form_checkbox: ICheckbox[];
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

//inspectable_object_inspection_form_main_section(inspectable_object_inspection_form_sub_section(form_checkbox_group(form_checkbox(id)),form_text_input_field(id)))
