import React from "react";
import Heading from "@/components/Heading";
import InspectionPlanMetadataCard from "@/components/InspectionPlanMetadataForm";

const NewInspectionPlan = async ({
  params,
}: {
  params: Promise<{ vehicle_id: string }>;
}) => {
  const vehicleId = (await params).vehicle_id;
  return (
    <div>
      <Heading>New inspection plan</Heading>
      <div className="p-2 flex justify-center">
        <InspectionPlanMetadataCard
          vehicle_id={vehicleId}
        ></InspectionPlanMetadataCard>
      </div>
    </div>
  );
};

export default NewInspectionPlan;
