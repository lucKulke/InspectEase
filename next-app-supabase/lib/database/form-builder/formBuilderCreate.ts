import { SupabaseClient } from "@supabase/supabase-js";
import {
  IInspectableObjectProfileInsert,
  IInspectableObjectProfilePropertyInsert,
  IInspectableObjectProfilePropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectResponse,
} from "./formBuilderInterfaces";
import { SupabaseError } from "../../globalInterfaces";
import { UUID } from "crypto";

export class DBActionsFormBuilderCreate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async createInspectableObjectProfile(
    profile: IInspectableObjectProfileInsert
  ): Promise<{
    inspectableObjectProfile: IInspectableObjectProfileResponse;
    inspectableObjectProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .insert([profile])
      .select();

    console.log("create inspectable object profile in db:", data);
    if (error) {
      console.error("create inspectable object profile in db error: ", error);
    }

    return {
      inspectableObjectProfile: data ? data[0] : null,
      inspectableObjectProfileError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectProfileProperty(
    property: IInspectableObjectProfilePropertyInsert
  ): Promise<{
    inspectableObjectProfileProperty: IInspectableObjectProfilePropertyResponse;
    inspectableObjectProfilePropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_property")
      .insert([property])
      .select();

    console.log("create inspectable object profile property in db:", data);
    if (error) {
      console.error(
        "create inspectable object profile property in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileProperty: data ? data[0] : null,
      inspectableObjectProfilePropertyError: error as SupabaseError | null,
    };
  }
}
