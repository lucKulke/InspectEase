import { SupabaseClient } from "@supabase/supabase-js";
import { IInspectableObjectsResponse } from "./formBuilderInterfaces";

export class DBActionsFormBuilder {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async fetchInspectableObjects(userId: string): Promise<{
    inspectableObjects: IInspectableObjectsResponse[];
    inspectableObjectsError: any;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_objects")
      .select("*")
      .eq("user_id", userId);

    console.log("data", data);
    console.log("error", error);

    return {
      inspectableObjects: data ? data : [],
      inspectableObjectsError: error,
    };
  }
}
