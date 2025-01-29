import { MainSection } from "@/lib/interfaces";
import React from "react";
import SubSectionComp from "./SubSectionComp";
import { createClient } from "@/utils/supabase/server";
import { DBActions } from "@/lib/dbActions";

interface MainSectionCompProps {
  mainSectionData: MainSection;
}

const MainSectionComp = async ({ mainSectionData }: MainSectionCompProps) => {
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);

  const { subSections, subSectionsError } =
    await dbActions.inspectionPlanFormFetchSubSectionByMainSection(
      mainSectionData.id
    );

  return (
    <div className="group">
      <p className="group-hover:text-black text-slate-600">
        {mainSectionData.name}
      </p>
      <div>
        <div className="group-hover:border-black border-2 mb-2 "></div>
        <ul className="space-y-5">
          {subSections.map((subSection) => (
            <li key={subSection.id} id={subSection.id}>
              <SubSectionComp subSectionData={subSection}></SubSectionComp>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MainSectionComp;
