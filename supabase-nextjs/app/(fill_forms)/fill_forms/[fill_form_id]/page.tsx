import { DBActions } from "@/lib/dbActions";
import { createClient } from "@/utils/supabase/server";
import React from "react";

import MainSectionComp from "./MainSectionComp";

const FillableForm = async ({
  params,
}: {
  params: Promise<{ fill_form_id: string }>;
}) => {
  const formId = (await params).fill_form_id;
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);

  const { form, formError } = await dbActions.inspectionPlanFetchFillableForm(
    formId
  );

  const { inspectionPlanMetaData, inspectionPlanMetaDataError } =
    await dbActions.fetchInspectionPlanMetaData(form.inspection_plan_id);

  const { mainSections, mainSectionErrors } =
    await dbActions.inspectionPlanFormFetchMainSection(form.inspection_plan_id);

  return (
    <ul className="m-10 border-2 rounded-xl p-10 space-y-10">
      {mainSections.map((mainSection) => (
        <li key={mainSection.id} id={mainSection.id}>
          <MainSectionComp mainSectionData={mainSection}></MainSectionComp>
        </li>
      ))}
    </ul>
  );
};

export default FillableForm;
