import { DBActions } from "@/lib/dbActions";
import { SubSection } from "@/lib/interfaces";
import { createClient } from "@/utils/supabase/server";
import React from "react";

import SingleTextFieldGroupComp from "./fieldGroups/SingleTextFieldGroupComp";
import SingleCrossFieldGroupComp from "./fieldGroups/SingleCrossFieldGroupComp";
import MultiCrossFieldGroupComp from "./fieldGroups/MultiCrossFieldGroupComp";

interface SubSectionCompProps {
  subSectionData: SubSection;
}

const SubSectionComp = async ({ subSectionData }: SubSectionCompProps) => {
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);

  const { fieldGroups, fieldGroupsError } =
    await dbActions.inspectionPlanFormFetchFieldGroupsBySubSectionId(
      subSectionData.id
    );

  return (
    <div className="border-2 rounded-xl p-4">
      <p>{subSectionData.name}</p>
      <ul>
        {fieldGroups.map((fieldGroup) => (
          <li key={fieldGroup.id} id={fieldGroup.id}>
            {fieldGroup.type === "singleText" && (
              <SingleTextFieldGroupComp
                singleTextFieldGroup={fieldGroup}
              ></SingleTextFieldGroupComp>
            )}
            {fieldGroup.type === "singleCross" && (
              <SingleCrossFieldGroupComp
                singleCrossFieldGroup={fieldGroup}
              ></SingleCrossFieldGroupComp>
            )}
            {fieldGroup.type === "multiCross" && (
              <MultiCrossFieldGroupComp
                multiCrossFieldGroup={fieldGroup}
              ></MultiCrossFieldGroupComp>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubSectionComp;
