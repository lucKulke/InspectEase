"use client";
import React, { useState } from "react";
import { FormSideBar } from "./sidebar/SideBar";

import { ErrorHandler } from "@/components/ErrorHandler";
import { error } from "console";
import { UUID } from "crypto";
import { IInspectableObjectInspectionFormMainSectionWithSubSection } from "@/lib/database/form-builder/formBuilderInterfaces";

interface MainFormSectionProps {
  formId: UUID;
  mainSectionsWithSubsections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
}

export const MainFormSection = ({
  formId,
  mainSectionsWithSubsections,
}: MainFormSectionProps) => {
  const [mainSubSections, setMainSubSections] = useState<
    IInspectableObjectInspectionFormMainSectionWithSubSection[]
  >(mainSectionsWithSubsections);

  return (
    <div className="flex h-screen p-4">
      <div className="flex flex-1 overflow-hidden bg-white rounded-lg shadow-lg ">
        <FormSideBar
          formId={formId}
          setMainSubSections={setMainSubSections}
          mainSubSections={mainSubSections}
        ></FormSideBar>
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">Editor</div>
      </div>
    </div>
  );
};
