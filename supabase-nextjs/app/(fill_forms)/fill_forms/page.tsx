import React from "react";

import { createClient } from "@/utils/supabase/server";
import { Bike, Car, Truck, LogIn, Plus } from "lucide-react";
import { DBActions } from "@/lib/dbActions";
import Link from "next/link";
import Heading from "@/components/Heading";
import InspectionPlanCard from "@/components/InspectionPlanCard";

const FillForms = async () => {
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);

  let { forms, error } = await dbActions.inspectionPlanFetchFillableForms();

  const vehicleTypes: Record<string, any> = {
    motorbike: <Bike />,
    car: <Car />,
    truck: <Truck />,
  };

  return (
    <>
      <div className="flex items-center">
        <Heading>Fillable Forms</Heading>
        <Link
          className="border-2 p-2 rounded-xl hover:bg-slate-600 hover:border-slate-600 active:bg-black"
          href={"/fill_forms/create"}
        >
          <Plus />
        </Link>
      </div>
      <div className="p-7 grid grid-cols-4 gap-4">
        {forms.map((form) => (
          <InspectionPlanCard
            key={form.id}
            formMetadata={form}
          ></InspectionPlanCard>
        ))}
      </div>
    </>
  );
};

export default FillForms;
