import { SupabaseClient } from "@supabase/supabase-js";
import {
  IInspectableObjectProfileInsert,
  IInspectableObjectProfilePropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectPropertyResponse,
  IInspectableObjectResponse,
} from "./formBuilderInterfaces";
import { SupabaseError } from "../../globalInterfaces";
import { UUID } from "crypto";

export class DBActionsFormBuilderUpdate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async updateInspectableObjectProfile(
    profileId: UUID,
    profile: IInspectableObjectProfileInsert
  ): Promise<{
    updatedInspectableObjectProfile: IInspectableObjectProfileResponse;
    updatedInspectableObjectProfileError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .update(profile)
      .eq("id", profileId)
      .select();

    console.log("update inspectable object profiles in db:", data);
    if (error) {
      console.error("update inspectable object profiles in db error: ", error);
    }

    return {
      updatedInspectableObjectProfile: data ? data[0] : null,
      updatedInspectableObjectProfileError: error as SupabaseError | null,
    };
  }

  async updateInspectableObjectProfileProperty(
    propertys: IInspectableObjectProfilePropertyResponse[]
  ): Promise<{
    updatedInspectableObjectProfilePropertys: IInspectableObjectProfileResponse[];
    updatedInspectableObjectProfilePropertysError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_property")
      .upsert(propertys)
      .select();

    console.log("update inspectable object profiles in db:", data);
    if (error) {
      console.error("update inspectable object profiles in db error: ", error);
    }

    return {
      updatedInspectableObjectProfilePropertys: data ? data : [],
      updatedInspectableObjectProfilePropertysError:
        error as SupabaseError | null,
    };
  }

  async updateInspectableObjectProperty(
    propertyId: UUID,
    property: {}
  ): Promise<{
    updatedInspectableObjectProperty: IInspectableObjectPropertyResponse | null;
    updatedInspectableObjectPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_property")
      .update(property)
      .eq("id", propertyId)
      .select();

    console.log("update inspectable object property in db:", data);
    if (error) {
      console.error("update inspectable object property in db error: ", error);
    }

    return {
      updatedInspectableObjectProperty: data ? data[0] : null,
      updatedInspectableObjectPropertyError: error as SupabaseError | null,
    };
  }
}
