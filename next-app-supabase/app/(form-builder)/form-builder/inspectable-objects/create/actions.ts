"use server";
import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import {
  IInspectableObjectInsert,
  IInspectableObjectPropertyInsert,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";

export async function fetchUsersAvailableObjectProfiles(
  userId: UUID,
  supabase: SupabaseClient<any, string, any>
) {
  const dbActions = new DBActionsFormBuilderFetch(supabase);
  return await dbActions.fetchInspectableObjectProfiles(userId);
}

export async function fetchObjectProfileObjPropertys(profileId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  return await dbActions.fetchInspectableObjectProfileObjPropertys(profileId);
}

export async function createObject(profileId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createInspectableObject({
    profile_id: profileId,
  } as IInspectableObjectInsert);
}

export async function createObjectPropertys(
  objectId: UUID,
  propertyData: Record<string, string>
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  const propertyDataList: IInspectableObjectPropertyInsert[] = [];

  for (const [key, value] of Object.entries(propertyData)) {
    propertyDataList.push({
      object_id: objectId,
      profile_property_id: key,
      value: value,
    } as IInspectableObjectPropertyInsert);
  }

  return await dbActions.createInspectableObjectProperty(propertyDataList);
}
