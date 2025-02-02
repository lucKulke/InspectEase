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

  async deleteInspectableObjectProfileProperty(propertyId: UUID): Promise<{
    deletedInspectableObjectProfileProperty: IInspectableObjectProfileResponse;
    deletedInspectableObjectProfilePropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_property")
      .delete()
      .eq("id", propertyId)
      .select();

    console.log("delete inspectable object profile property in db:", data);
    if (error) {
      console.error(
        "delete inspectable object profile property in db error:",
        error
      );
    }

    return {
      deletedInspectableObjectProfileProperty: data ? data[0] : null,
      deletedInspectableObjectProfilePropertyError:
        error as SupabaseError | null,
    };
  }
}
