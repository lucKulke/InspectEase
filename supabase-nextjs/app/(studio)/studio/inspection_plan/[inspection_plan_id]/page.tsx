import React from "react";
import Heading from "@/components/Heading";
import { createClient } from "@/utils/supabase/server";
import { DBActions } from "@/lib/dbActions";
import InspectionPlanMetadataInfoCard from "@/components/InspectionPlanMetadataInfoCard";
import FormEditor from "@/components/FormEditor";

const InspectionPlan = async ({
  params,
}: {
  params: Promise<{ inspection_plan_id: string }>;
}) => {
  const inspectionPlanId = (await params).inspection_plan_id;
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);
  const { data, error } = await dbActions.fetchInspectionPlanMetaData(
    inspectionPlanId
  );
  console.log(data);

  return (
    <div>
      <Heading>Form Editor</Heading>
      <div className="flex justify-end">
        <InspectionPlanMetadataInfoCard
          infos={data[0]}
        ></InspectionPlanMetadataInfoCard>
      </div>
      <div className="mt-3">
        <FormEditor inspectionPlanId={inspectionPlanId}></FormEditor>
      </div>
    </div>
  );
};

export default InspectionPlan;
