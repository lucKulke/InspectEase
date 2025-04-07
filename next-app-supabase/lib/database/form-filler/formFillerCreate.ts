import { SupabaseClient } from "@supabase/supabase-js";
import {
  IFillableFormInsert,
  IFillableFormResponse,
} from "./formFillerInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";

export class DBActionsFormFillerCreate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async createNewStringExtractionTrainingExamples(
    form: IFillableFormInsert
  ): Promise<{
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
}
