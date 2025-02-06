import { SupabaseClient } from "@supabase/supabase-js";
import {
  IInspectableObjectProfileFormPropertyResponse,
  IInspectableObjectProfileFormTypePropertyInsert,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileInsert,
  IInspectableObjectProfileObjPropertyResponse,
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

  async updateInspectableObjectProfileObjProperty(
    propertys: IInspectableObjectProfileObjPropertyResponse[]
  ): Promise<{
    updatedInspectableObjectProfileObjPropertys: IInspectableObjectProfileObjPropertyResponse[];
    updatedInspectableObjectProfileObjPropertysError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_obj_property")
      .upsert(propertys)
      .select();

    console.log("update inspectable object profile obj propertys in db:", data);
    if (error) {
      console.error(
        "update inspectable object profile obj propertys in db error: ",
        error
      );
    }

    return {
      updatedInspectableObjectProfileObjPropertys: data ? data : [],
      updatedInspectableObjectProfileObjPropertysError:
        error as SupabaseError | null,
    };
  }

  async updateInspectableObjectProfileFormProperty(
    propertys: IInspectableObjectProfileFormPropertyResponse[]
  ): Promise<{
    updatedInspectableObjectProfileFormPropertys: IInspectableObjectProfileFormPropertyResponse[];
    updatedInspectableObjectProfileFormPropertysError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_property")
      .upsert(propertys)
      .select();

    console.log("update inspectable object profile obj propertys in db:", data);
    if (error) {
      console.error(
        "update inspectable object profile obj propertys in db error: ",
        error
      );
    }

    return {
      updatedInspectableObjectProfileFormPropertys: data ? data : [],
      updatedInspectableObjectProfileFormPropertysError:
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

  async updateInspectableObjectProfileFormTypeProps(
    formTypeProps: IInspectableObjectProfileFormTypePropertyResponse[]
  ): Promise<{
    updatedInspectableObjectProfileFormTypeProperty: IInspectableObjectPropertyResponse | null;
    updatedInspectableObjectProfileFormTypePropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type_property")
      .upsert(formTypeProps)
      .select();

    console.log(
      "update inspectable object profile form type props in db:",
      data
    );
    if (error) {
      console.error(
        "update inspectable object profile form type props in db error: ",
        error
      );
    }

    return {
      updatedInspectableObjectProfileFormTypeProperty: data ? data[0] : null,
      updatedInspectableObjectProfileFormTypePropertyError:
        error as SupabaseError | null,
    };
  }
}
