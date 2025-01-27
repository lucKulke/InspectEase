import React from "react";
import FillableFormCreateCard from "@/components/FillableFormCreateCard";
import {
  fetchVehicles,
  fetchInspectionPlans,
  createFillableForm,
} from "./actions";

const CreateFillableForm = async () => {
  const { vehicles, error } = await fetchVehicles();

  return (
    <div className="flex justify-center mt-20">
      <FillableFormCreateCard
        fetchInspectionPlans={fetchInspectionPlans}
        availableVehicles={vehicles}
        createFillableForm={createFillableForm}
      ></FillableFormCreateCard>
    </div>
  );
};

export default CreateFillableForm;
