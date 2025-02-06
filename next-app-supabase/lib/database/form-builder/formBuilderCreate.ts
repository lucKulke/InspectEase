import { SupabaseClient } from "@supabase/supabase-js";
import {
  IInspectableObjectInsert,
  IInspectableObjectProfileFormPropertyInsert,
  IInspectableObjectProfileFormPropertyResponse,
  IInspectableObjectProfileFormTypeInsert,
  IInspectableObjectProfileFormTypePropertyInsert,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileInsert,
  IInspectableObjectProfileObjPropertyInsert,
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectPropertyInsert,
  IInspectableObjectPropertyResponse,
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

  async createInspectableObjectProfileObjProperty(
    property: IInspectableObjectProfileObjPropertyInsert
  ): Promise<{
    inspectableObjectProfileObjProperty: IInspectableObjectProfileObjPropertyResponse;
    inspectableObjectProfileObjPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_obj_property")
      .insert([property])
      .select();

    console.log("create inspectable object profile obj property in db:", data);
    if (error) {
      console.error(
        "create inspectable object profile obj property in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileObjProperty: data ? data[0] : null,
      inspectableObjectProfileObjPropertyError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectProfileFormProperty(
    property: IInspectableObjectProfileFormPropertyInsert
  ): Promise<{
    inspectableObjectProfileFormProperty: IInspectableObjectProfileFormPropertyResponse;
    inspectableObjectProfileFormPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_property")
      .insert([property])
      .select();

    console.log("create inspectable object profile form property in db:", data);
    if (error) {
      console.error(
        "create inspectable object profile property from in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileFormProperty: data ? data[0] : null,
      inspectableObjectProfileFormPropertyError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectProperty(
    propertyData: IInspectableObjectPropertyInsert[]
  ): Promise<{
    inspectableObjectPropertys: IInspectableObjectPropertyResponse[];
    inspectableObjectPropertysError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_property")
      .insert(propertyData)
      .select();

    console.log("create inspectable object property in db:", data);
    if (error) {
      console.error("create inspectable object property in db error: ", error);
    }

    return {
      inspectableObjectPropertys: data ? data : [],
      inspectableObjectPropertysError: error as SupabaseError | null,
    };
  }

  async createInspectableObject(object: IInspectableObjectInsert): Promise<{
    inspectableObject: IInspectableObjectResponse;
    inspectableObjectError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .insert([object])
      .select();

    console.log("create inspectable object in db:", data);
    if (error) {
      console.error("create inspectable object in db error: ", error);
    }

    return {
      inspectableObject: data ? data[0] : null,
      inspectableObjectError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectProfileFormType(
    formType: IInspectableObjectProfileFormTypeInsert
  ): Promise<{
    inspectableObjectProfileFormType: IInspectableObjectProfileFormTypeResponse | null;
    inspectableObjectProfileFormTypeError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type")
      .insert([formType])
      .select();

    console.log("create inspectable object profile form type in db:", data);
    if (error) {
      console.error(
        "create inspectable object profile form type in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileFormType: data ? data[0] : null,
      inspectableObjectProfileFormTypeError: error as SupabaseError | null,
    };
  }

  async createInspectableObjectProfileFormTypeProp(
    formTypeProp: IInspectableObjectProfileFormTypePropertyInsert
  ): Promise<{
    inspectableObjectProfileFormTypeProp: IInspectableObjectProfileFormTypePropertyResponse | null;
    inspectableObjectProfileFormTypePropError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type_property")
      .insert([formTypeProp])
      .select();

    console.log("create inspectable object profile form type propin db:", data);
    if (error) {
      console.error(
        "create inspectable object profile form type prop in db error: ",
        error
      );
    }

    return {
      inspectableObjectProfileFormTypeProp: data ? data[0] : null,
      inspectableObjectProfileFormTypePropError: error as SupabaseError | null,
    };
  }
}
