import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";
import { IFillableFormResponse } from "./formFillerInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";

export class DBActionsFormFillerDelete {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }
  async deleteFillableForms(formIds: UUID[]): Promise<{
    deletedForm: IFillableFormResponse[] | null;
    deletedFormError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form")
      .delete()
      .in("id", formIds)
      .select();

    console.log("delete fillable forms in db:", data);
    if (error) {
      console.error("delete fillable forms in db error:", error);
    }

    return {
      deletedForm: data,
      deletedFormError: error as SupabaseError | null,
    };
  }
}
