import { SupabaseError } from "@/lib/globalInterfaces";
import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";
import {
  IFillableCheckboxResponse,
  IFillableFormResponse,
  IFillableTextInputFieldResponse,
  IFormData,
  IMainCheckboxWithSubCheckboxData,
} from "./formFillerInterfaces";

export class DBActionsFormFillerFetch {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async fetchFillableForm(formId: UUID): Promise<{
    form: IFillableFormResponse | null;
    formError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form")
      .select()
      .eq("id", formId)
      .single();

    console.log("fetch fillable form in db:", data);
    if (error) {
      console.error("fetch fillable form in db error: ", error);
    }

    return {
      form: data,
      formError: error as SupabaseError | null,
    };
  }

  async fetchTextInputFields(formId: UUID): Promise<{
    textInputFields: IFillableTextInputFieldResponse[];
    textInputFieldsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("text_input")
      .select()
      .eq("fillable_form_id", formId);

    console.log("fetch fillable form in db:", data);
    if (error) {
      console.error("fetch fillable form in db error: ", error);
    }

    return {
      textInputFields: data ? data : [],
      textInputFieldsError: error as SupabaseError | null,
    };
  }

  async fetchAllFillableForms(userId: string): Promise<{
    forms: IFillableFormResponse[] | null;
    formsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form")
      .select()
      .eq("user_id", userId);

    console.log("fetch fillable forms in db:", data);
    if (error) {
      console.error("fetch fillable forms in db error: ", error);
    }

    return {
      forms: data,
      formsError: error as SupabaseError | null,
    };
  }

  async fetchCheckboxes(formId: UUID): Promise<{
    checkboxes: IMainCheckboxWithSubCheckboxData[];
    checkboxesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("main_checkbox")
      .select(
        `
        *, checkbox(*)
        `
      )
      .eq("fillable_form_id", formId);

    console.log("fetch fillable checkboxes in db:", data);
    if (error) {
      console.error("fetch fillable checkboxes in db error: ", error);
    }

    return {
      checkboxes: data ? data : [],
      checkboxesError: error as SupabaseError | null,
    };
  }

  async fetchAllCheckboxesAndTextInputFieldsByFormId(formId: UUID): Promise<{
    fields: IFormData | null;
    fieldsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_inspection_form")
      .select(
        `inspectable_object_inspection_form_main_section(inspectable_object_inspection_form_sub_section(form_checkbox_group(form_checkbox(id), form_checkbox_task(id)),form_text_input_field(id)))
        `
      )
      .eq("id", formId)
      .single();

    console.log("fetch fillable fields in db:", data);
    if (error) {
      console.error("fetch fillable fields in db error: ", error);
    }

    return {
      fields: data,
      fieldsError: error as SupabaseError | null,
    };
  }
}
