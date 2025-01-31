import { SupabaseClient } from "@supabase/supabase-js";
import {
  IInspectableObjectProfileInsert,
  IInspectableObjectProfileResponse,
  IInspectableObjectResponse,
} from "./formBuilderInterfaces";
import { SupabaseError } from "../globalInterfaces";
import { UUID } from "crypto";

export class DBActionsFormBuilder {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async fetchInspectableObjects(userId: string): Promise<{
    inspectableObjects: IInspectableObjectResponse[];
    inspectableObjectsError: SupabaseError;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .select("*")
      .eq("user_id", userId);

    console.log("fetch inspectable objects in db:", data);
    if (error) {
      console.error("fetch inspectable objects in db error: ", error);
    }

    return {
      inspectableObjects: data ? data : [],
      inspectableObjectsError: error as SupabaseError,
    };
  }

  async fetchInspectableObjectProfiles(userId: string): Promise<{
    inspectableObjectProfiles: IInspectableObjectProfileResponse[];
    inspectableObjectProfilesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .select("*")
      .eq("user_id", userId);

    console.log("fetch inspectable object profiles in db:", data);
    if (error) {
      console.error("fetch inspectable object profiles in db error: ", error);
    }

    return {
      inspectableObjectProfiles: data ? data : [],
      inspectableObjectProfilesError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectProfile(profileId: UUID): Promise<{
    inspectableObjectProfile: IInspectableObjectProfileResponse | null;
    inspectableObjectProfilesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .select("*")
      .eq("id", profileId);

    console.log("fetch inspectable object profile in db:", data);
    if (error) {
      console.error("fetch inspectable object profile in db error: ", error);
    }

    return {
      inspectableObjectProfile: data
        ? (data[0] as IInspectableObjectProfileResponse)
        : null,
      inspectableObjectProfilesError: error as SupabaseError | null,
    };
  }
  async createInspectableObjectProfile(
    profile: IInspectableObjectProfileInsert,
    iconKey: string
  ): Promise<{
    inspectableObjectProfiles: IInspectableObjectProfileResponse[];
    inspectableObjectProfilesError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile")
      .insert([
        {
          name: profile.name,
          description: profile.description,
          icon_key: iconKey,
        },
      ])
      .select();

    console.log("create inspectable object profiles in db:", data);
    if (error) {
      console.error("create inspectable object profiles in db error: ", error);
    }

    return {
      inspectableObjectProfiles: data ? data : [],
      inspectableObjectProfilesError: error as SupabaseError | null,
    };
  }
}
