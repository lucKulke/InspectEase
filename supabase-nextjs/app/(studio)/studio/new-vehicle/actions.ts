"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { VehicleFormValues } from "./page";
import { DBActions } from "@/lib/dbActions";
import { Vehicle } from "@/lib/interfaces";

export async function createVehicle(
  formData: VehicleFormValues
): Promise<{ data: Vehicle[]; error: any }> {
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);
  const { data, error } = await dbActions.createNewVehicle(formData);

  return { data, error };
}
