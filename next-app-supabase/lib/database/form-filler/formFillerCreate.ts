import { SupabaseClient } from "@supabase/supabase-js";
import {
  IFillableCheckboxInsert,
  IFillableCheckboxResponse,
  IFillableFormInsert,
  IFillableFormResponse,
  IFillableMainCheckboxInsert,
  IFillableTextInputFieldInsert,
  IFillableTextInputFieldResponse,
} from "./formFillerInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";

export class DBActionsFormFillerCreate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async createNewFillableForm(form: IFillableFormInsert): Promise<{
    form: IFillableFormResponse | null;
    formError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form")
      .insert(form)
      .select()
      .single();

    console.log("create new fillable form in db:", data);
    if (error) {
      console.error("create new fillable form in db error: ", error);
    }

    return {
      form: data,
      formError: error as SupabaseError | null,
    };
  }

  async createNewFillableMainCheckboxes(
    checkboxes: IFillableMainCheckboxInsert[]
  ): Promise<{
    mainCheckboxes: IFillableCheckboxResponse[] | null;
    mainCheckboxesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("main_checkbox")
      .insert(checkboxes)
      .select();

    console.log("create new fillable main checkboxes in db:", data);
    if (error) {
      console.error("create new fillable main checkboxes in db error: ", error);
    }

    return {
      mainCheckboxesError: error as SupabaseError | null,
      mainCheckboxes: data,
    };
  }

  async createNewFillableCheckboxes(
    checkboxes: IFillableCheckboxInsert[]
  ): Promise<{
    checkboxes: IFillableCheckboxResponse[] | null;
    checkboxesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("checkbox")
      .insert(checkboxes)
      .select();

    console.log("create new fillable checkboxes in db:", data);
    if (error) {
      console.error("create new fillable checkboxes in db error: ", error);
    }

    return {
      checkboxesError: error as SupabaseError | null,
      checkboxes: data,
    };
  }

  async createNewFillableTextInputFields(
    textInputFields: IFillableTextInputFieldInsert[]
  ): Promise<{
    textInputFields: IFillableTextInputFieldResponse[] | null;
    textInputFieldsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("text_input")
      .insert(textInputFields)
      .select();

    console.log("create new fillable textInputFields in db:", data);
    if (error) {
      console.error("create new fillable textInputFields in db error: ", error);
    }

    return {
      textInputFields: data,
      textInputFieldsError: error as SupabaseError | null,
    };
  }
}
