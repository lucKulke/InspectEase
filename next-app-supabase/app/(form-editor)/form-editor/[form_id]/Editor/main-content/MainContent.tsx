"use client";
import { IInspectableObjectInspectionFormMainSectionWithSubSection } from "@/lib/database/form-builder/formBuilderInterfaces";
import React from "react";

interface MainContentProps {
  mainSubSections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
}

export const MainContent = ({ mainSubSections }: MainContentProps) => {
  return (
    <ul>
      {mainSubSections.map((mainSubSection) => (
        <li key={mainSubSection.id}>
          <p className="underline">{mainSubSection.name}</p>
          <ul className="border-2 min-h-10"></ul>
        </li>
      ))}
    </ul>
  );
};
