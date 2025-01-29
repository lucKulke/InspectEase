"use server";

import { DBActions } from "@/lib/dbActions";
import {
  FillableFormsMetadata,
  InspectionPlan,
  Vehicle,
} from "@/lib/interfaces";
import { createClient } from "@/utils/supabase/server";

export async function fetchVehicles(): Promise<{
  vehicles: Vehicle[];
  error: any;
}> {
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);
  const { vehicles, error } = await dbActions.fetchVehicles();

  return { vehicles, error };
}

export async function fetchInspectionPlans(vehicleId: string): Promise<{
  inspectionPlans: InspectionPlan[];
  inspectionPlansError: any;
}> {
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);
  const { inspectionPlans, inspectionPlansError } =
    await dbActions.fetchInspectionPlans(vehicleId);

  return { inspectionPlans, inspectionPlansError };
}

interface FillableFormFields {
  fillable_form_id: string;
  field_id: string;
}

export async function createFillableForm(formData: {
  orderNumber: string;
  inspectionPlanId: string;
}): Promise<{
  fillableForm: FillableFormsMetadata;
  fillableFormError: any;
}> {
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);

  const { fillableForm, fillableFormError } =
    await dbActions.createFillableForm(formData);

  const { fields, fieldsError } = await dbActions.inspectionPlanFormFetchFields(
    fillableForm.inspection_plan_id
  );

  const fillableFormFieldsArray: FillableFormFields[] = [];

  fields.forEach((field) => {
    fillableFormFieldsArray.push({
      fillable_form_id: fillableForm.id,
      field_id: field.id,
    });
  });

  const { fillableFormFields, fillableFormFieldsError } =
    await dbActions.createFillableFormFields(fillableFormFieldsArray);

  return { fillableForm, fillableFormError };
}
