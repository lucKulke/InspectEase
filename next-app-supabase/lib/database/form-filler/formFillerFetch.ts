import { SupabaseError } from "@/lib/globalInterfaces";
import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";
import { IFillableFormResponse } from "./formFillerInterfaces";

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

  async fetchAllFillableForms(userId: UUID): Promise<{
    forms: IFillableFormResponse[] | null;
    formsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form")
      .select()
      .eq("user_id", userId);

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
