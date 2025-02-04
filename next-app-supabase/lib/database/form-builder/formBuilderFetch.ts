import { SupabaseClient } from "@supabase/supabase-js";
import {
  IInspectableObjectProfilePropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectPropertyResponse,
  IInspectableObjectResponse,
} from "./formBuilderInterfaces";
import { SupabaseError } from "../../globalInterfaces";
import { UUID } from "crypto";

export class DBActionsFormBuilderFetch {
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

  async fetchInspectableObject(objectId: UUID): Promise<{
    inspectableObject: IInspectableObjectResponse | null;
    inspectableObjectError: SupabaseError;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .select("*")
      .eq("id", objectId);

    console.log("fetch inspectable object in db:", data);
    if (error) {
      console.error("fetch inspectable object in db error: ", error);
    }

    return {
      inspectableObject: data ? data[0] : null,
      inspectableObjectError: error as SupabaseError,
    };
  }
  async fetchInspectableObjectPropertys(objectId: UUID): Promise<{
    inspectableObjectPropertys: IInspectableObjectPropertyResponse[];
    inspectableObjectPropertysError: SupabaseError;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_property")
      .select("*")
      .eq("object_id", objectId);

    console.log("fetch inspectable objects in db:", data);
    if (error) {
      console.error("fetch inspectable objects in db error: ", error);
    }

    return {
      inspectableObjectPropertys: data ? data : [],
      inspectableObjectPropertysError: error as SupabaseError,
    };
  }

  async fetchInspectableObjectWithProperties(objectId: UUID): Promise<null> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .select("*, inspectable_object_property(*)")
      .eq("id", objectId);

    console.log("fetch inspectable objects test in db:", data);
    if (error) {
      console.error("fetch inspectable objects test in db error: ", error);
    }

    if (data) {
      const newData = data as Special[];
      console.log(newData[0].inspectable_object_property);
    }
    return null;

    // return {
    //   inspectableObjectPropertys: data ? data : [],
    //   inspectableObjectPropertysError: error as SupabaseError,
    // };
  }

  async fetchInspectableObjectsByProfileId(profileId: UUID): Promise<{
    inspectableObjects: IInspectableObjectResponse[];
    inspectableObjectsError: SupabaseError;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .select("*")
      .eq("profile_id", profileId);

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
    inspectableObjectProfileError: SupabaseError | null;
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
      inspectableObjectProfile: data ? data[0] : null,
      inspectableObjectProfileError: error as SupabaseError | null,
    };
  }

  async fetchInspectableObjectProfilePropertys(profileId: UUID): Promise<{
    inspectableObjectProfilePropertys: IInspectableObjectProfilePropertyResponse[];
    inspectableObjectProfilePropertysError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_property")
      .select("*")
      .eq("profile_id", profileId);

    console.log("fetch inspectable object profile in db:", data);
    if (error) {
      console.error("fetch inspectable object profile in db error: ", error);
    }

    return {
      inspectableObjectProfilePropertys: data ? data : [],
      inspectableObjectProfilePropertysError: error as SupabaseError | null,
    };
  }
}
