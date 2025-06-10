import { SupabaseError } from "@/lib/globalInterfaces";
import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";
import {
  IFillableFormPlusFillableFields,
  IFillableFormResponse,
  IFormData,
} from "./formFillerInterfaces";

export class DBActionsFormFillerFetch {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async fetchFillableFormData(formId: UUID): Promise<{
    formData: IFormData | null;
    formDataError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form")
      .select(
        `*, main_section(*, sub_section(*, checkbox_group(*, main_checkbox(*, sub_checkbox(*)), task(*)), text_input(*)))`
      )
      .eq("id", formId)
      .single();

    console.log("fetch fillable form data from db:", data);
    if (error) {
      console.error("fetch fillable form data from db error: ", error);
    }

    return {
      formData: data,
      formDataError: error as SupabaseError | null,
    };
  }

  async fetchAllFillableForms(userId: UUID): Promise<{
    forms: IFillableFormPlusFillableFields[] | null;
    formsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form")
      .select(
        `*, main_section(sub_section(text_input(value),checkbox_group(main_checkbox(checked,sub_checkbox(checked)))))`
      );

    console.log("fetch all fillable form in db:", data);
    if (error) {
      console.error("fetch all fillable form in db error: ", error);
    }

    return {
      forms: data,
      formsError: error as SupabaseError | null,
    };
  }
}
