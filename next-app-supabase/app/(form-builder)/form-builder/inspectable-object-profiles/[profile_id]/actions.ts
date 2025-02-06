"use server";

import {
  IInspectableObjectProfileFormPropertyInsert,
  IInspectableObjectProfileFormPropertyResponse,
  IInspectableObjectProfileFormTypeInsert,
  IInspectableObjectProfileFormTypePropertyInsert,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileObjPropertyInsert,
  IInspectableObjectProfileObjPropertyResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";

export async function createProfileObjProperty(
  property: IInspectableObjectProfileObjPropertyInsert
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createInspectableObjectProfileObjProperty(property);
}

export async function createProfileFormProperty(
  property: IInspectableObjectProfileFormPropertyInsert
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createInspectableObjectProfileFormProperty(property);
}

export async function updateProfileObjProperty(
  property: IInspectableObjectProfileObjPropertyResponse[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);

  return await dbActions.updateInspectableObjectProfileObjProperty(property);
}

export async function updateProfileFormProperty(
  property: IInspectableObjectProfileFormPropertyResponse[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);

  return await dbActions.updateInspectableObjectProfileFormProperty(property);
}

export async function deleteProfileObjProperty(propertyId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteInspectableObjectProfileObjProperty(propertyId);
}

export async function deleteProfileFormProperty(propertyId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteInspectableObjectProfileFormProperty(propertyId);
}

export async function createFormType(
  formType: IInspectableObjectProfileFormTypeInsert
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createInspectableObjectProfileFormType(formType);
}

export async function fetchFormTypeProps(formTypeId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  return await dbActions.fetchInspectableObjectProfileFormTypeProps(formTypeId);
}

export async function updateProfileFormTypeProps(
  formTypeProps: IInspectableObjectProfileFormTypePropertyResponse[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);

  return await dbActions.updateInspectableObjectProfileFormTypeProps(
    formTypeProps
  );
}

export async function createFormTypeProp(
  formTypeProp: IInspectableObjectProfileFormTypePropertyInsert
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createInspectableObjectProfileFormTypeProp(
    formTypeProp
  );
}

export async function deleteFormTypeProp(propertyId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteInspectableObjectProfileFormTypeProp(propertyId);
}

export async function deleteFormType(formTypeId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);

  return await dbActions.deleteProfileFormType(formTypeId);
}
