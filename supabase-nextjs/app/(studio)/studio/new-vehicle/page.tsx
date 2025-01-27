import React from "react";
import { createVehicle } from "./actions";

import VehicleDataForm from "@/components/VehicleDataForm";
import Heading from "@/components/Heading";
import * as z from "zod";

export const carSchema = z.object({
  type: z.enum(["car", "motorbike", "truck"], {
    required_error: "Please select a vehicle type.",
  }),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  hsn: z.string().min(1, "HSN is required"),
  tsn: z.string().min(1, "TSN is required"),
});

export type VehicleFormValues = z.infer<typeof carSchema>;

const NewVehicle = () => {
  return (
    <div>
      <Heading>New Vehicle</Heading>
      <div className="p-2 flex justify-center">
        <VehicleDataForm createVehicle={createVehicle}></VehicleDataForm>
      </div>
    </div>
  );
};

export default NewVehicle;
