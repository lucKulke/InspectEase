"use client";
import { IInspectableObjectInspectionFormSubSectionResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import React from "react";

interface SubSectionProps {
  subSection: IInspectableObjectInspectionFormSubSectionResponse;
}

export const SubSection = ({ subSection }: SubSectionProps) => {
  return (
    <div>
      <p>{subSection.name}</p>
    </div>
  );
};
