import React from "react";

import VehicleDataForm from "@/components/VehicleDataForm";
import Heading from "@/components/Heading";

const NewVehicle = () => {
  return (
    <div>
      <Heading>New Vehicle</Heading>
      <div className="p-2 flex justify-center">
        <VehicleDataForm></VehicleDataForm>
      </div>
    </div>
  );
};

export default NewVehicle;
