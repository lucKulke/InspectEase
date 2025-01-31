import { SupabaseClient } from "@supabase/supabase-js";
import {
  IInspectableObjectProfileInsert,
  IInspectableObjectProfileResponse,
  IInspectableObjectResponse,
} from "./formBuilderInterfaces";
import { SupabaseError } from "../../globalInterfaces";
import { UUID } from "crypto";

export class DBActionsFormBuilderDelete {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async deleteInspectableObjectProfile(profileId: UUID): Promise<{
    deletedInspectableObjectProfile: IInspectableObjectProfileResponse;
    deletedInspectableObjectProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .delete()
      .eq("id", profileId)
      .select();

    console.log("delete inspectable object profiles in db:", data);
    if (error) {
      console.error("delete inspectable object profiles in db error: ", error);
    }

    return {
      deletedInspectableObjectProfile: data ? data[0] : null,
      deletedInspectableObjectProfileError: error as SupabaseError | null,
    };
  }
}
