import React from "react";
import UploadFile from "@/app/customComponents/UploadFile";
import VehicleDataForm from "@/app/customComponents/VehicleDataForm";

const NewPlan = () => {
  return (
    <div>
      <h1 className="m-7 text-xl">New Vehicle</h1>
      <VehicleDataForm></VehicleDataForm>
    </div>
  );
};

export default NewPlan;
