import React from "react";
import VehicleInfoCard from "@/components/VehicleInfoCard";
import { DBActions } from "@/lib/dbActions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Heading from "@/components/Heading";
import VehicleInspectionPlanList from "@/components/VehicleInspectionPlanList";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import Link from "next/link";
const Vehicle = async ({
  params,
}: {
  params: Promise<{ vehicle_id: string }>;
}) => {
  const vehicleId = (await params).vehicle_id;
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);

  const fetchVehicle = async () => {
    const { vehicles, error } = await dbActions.fetchVehicle(vehicleId);
    if (!vehicles) {
      redirect("/studio");
    }
    return vehicles[0];
  };

  const vehicle = await fetchVehicle();

  return (
    <div>
      <Heading>Vehicle</Heading>
      <div className="space-y-5">
        <VehicleInfoCard vehicle={vehicle}></VehicleInfoCard>
        <div className="flex justify-end items-center space-x-4">
          <Label htmlFor="create" className="text-slate-600">
            Create new inspection plan:
          </Label>
          <Link
            className="border-2 p-2 rounded-xl hover:bg-slate-600 hover:border-slate-600 active:bg-black"
            href={"/studio/vehicle/" + vehicleId + "/new_inspection_plan"}
            id="create"
          >
            <Plus />
          </Link>
        </div>
        <VehicleInspectionPlanList
          vehicleId={vehicleId}
        ></VehicleInspectionPlanList>
      </div>
    </div>
  );
};

export default Vehicle;
