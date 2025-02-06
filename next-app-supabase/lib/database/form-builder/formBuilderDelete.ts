import { SupabaseClient } from "@supabase/supabase-js";
import {
  IInspectableObjectProfileFormPropertyResponse,
  IInspectableObjectProfileFormTypeInsert,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeResponse,
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

  async deleteInspectableObjectProfileObjProperty(propertyId: UUID): Promise<{
    deletedInspectableObjectProfileObjProperty: IInspectableObjectProfileResponse;
    deletedInspectableObjectProfileObjPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_obj_property")
      .delete()
      .eq("id", propertyId)
      .select();

    console.log("delete inspectable object profile obj property in db:", data);
    if (error) {
      console.error(
        "delete inspectable object profile obj property in db error:",
        error
      );
    }

    return {
      deletedInspectableObjectProfileObjProperty: data ? data[0] : null,
      deletedInspectableObjectProfileObjPropertyError:
        error as SupabaseError | null,
    };
  }

  async deleteInspectableObjectProfileFormProperty(propertyId: UUID): Promise<{
    deletedInspectableObjectProfileFormProperty: IInspectableObjectProfileFormPropertyResponse;
    deletedInspectableObjectProfileFormPropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_property")
      .delete()
      .eq("id", propertyId)
      .select();

    console.log("delete inspectable object profile form property in db:", data);
    if (error) {
      console.error(
        "delete inspectable object profile form property in db error:",
        error
      );
    }

    return {
      deletedInspectableObjectProfileFormProperty: data ? data[0] : null,
      deletedInspectableObjectProfileFormPropertyError:
        error as SupabaseError | null,
    };
  }

  async deleteInspectableObjectProfileFormTypeProp(propertyId: UUID): Promise<{
    deletedInspectableObjectProfileFormTypeProperty: IInspectableObjectProfileFormTypePropertyResponse | null;
    deletedInspectableObjectProfileFormTypePropertyError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type_property")
      .delete()
      .eq("id", propertyId)
      .select();

    console.log(
      "delete inspectable object profile form type property in db:",
      data
    );
    if (error) {
      console.error(
        "delete inspectable object profile form type property in db error:",
        error
      );
    }

    return {
      deletedInspectableObjectProfileFormTypeProperty: data ? data[0] : null,
      deletedInspectableObjectProfileFormTypePropertyError:
        error as SupabaseError | null,
    };
  }

  async deleteProfileFormType(formTypeId: UUID): Promise<{
    deletedProfileFormType: IInspectableObjectProfileFormTypeResponse | null;
    deletedProfileFormTypeError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object_profile_form_type")
      .delete()
      .eq("id", formTypeId)
      .select();

    console.log("delete inspectable object in db:", data);
    if (error) {
      console.error("delete inspectable object  in db error:", error);
    }

    return {
      deletedProfileFormType: data ? data[0] : null,
      deletedProfileFormTypeError: error as SupabaseError | null,
    };
  }

  async deleteInspectableObject(objectId: UUID): Promise<{
    inspectableObject: IInspectableObjectProfileResponse | null;
    inspectableObjectError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("inspectable_object")
      .delete()
      .eq("id", objectId)
      .select();

    console.log("delete inspectable object in db:", data);
    if (error) {
      console.error("delete inspectable object  in db error:", error);
    }

    return {
      inspectableObject: data ? data[0] : null,
      inspectableObjectError: error as SupabaseError | null,
    };
  }
}
