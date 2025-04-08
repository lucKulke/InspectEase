"use client";
import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import { IInspectableObjectInspectionFormMainSectionWithSubSectionData } from "@/lib/database/form-builder/formBuilderInterfaces";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { UUID } from "crypto";

interface MainCompProps {
  formBuildData: IInspectableObjectInspectionFormMainSectionWithSubSectionData[];
}

export const MainComp = ({ formBuildData }: MainCompProps) => {
  const [sections, setSections] =
    useState<IInspectableObjectInspectionFormMainSectionWithSubSectionData[]>(
      formBuildData
    );

  const [selectedMainSections, setSelectedMainSections] = useState<UUID[]>([]);
  const [selectedSubSections, setSelectedSubSections] = useState<UUID[]>([]);

  const handleSelectMainSection = (mainSectionId: UUID) => {
    if (selectedMainSections.includes(mainSectionId)) {
      setSelectedMainSections((prev) =>
        prev.filter((mainSection) => mainSection !== mainSectionId)
      );
    } else {
      setSelectedMainSections((prev) => {
        const copy = [...prev];
        copy.push(mainSectionId);
        return copy;
      });
    }
  };

  const handleSelectSubSection = (subSectionId: UUID) => {
    if (selectedSubSections.includes(subSectionId)) {
      setSelectedSubSections((prev) =>
        prev.filter((subSection) => subSection !== subSectionId)
      );
    } else {
      setSelectedSubSections((prev) => {
        const copy = [...prev];
        copy.push(subSectionId);
        return copy;
      });
    }
  };

  return (
    <div className="p-6">
      <ul className="space-y-4">
        {sections.map((mainSection) => (
          <li key={mainSection.id}>
            <Card>
              <CardHeader
                className="cursor-pointer flex flex-row items-center space-y-0 py-4 select-none"
                onClick={() => handleSelectMainSection(mainSection.id)}
              >
                <CardTitle className="flex-1 text-xl">
                  {mainSection.name}
                </CardTitle>
                {selectedMainSections.includes(mainSection.id) ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </CardHeader>

              {selectedMainSections.includes(mainSection.id) && (
                <CardContent className="pt-2 pb-6">
                  <ul className="space-y-4">
                    {mainSection.inspectable_object_inspection_form_sub_section.map(
                      (subSection) => (
                        <li className={subSection.id}>
                          <Card>
                            <CardHeader
                              className="cursor-pointer flex flex-row items-center space-y-0 py-4 select-none"
                              onClick={() =>
                                handleSelectSubSection(subSection.id)
                              }
                            >
                              <CardTitle className="flex-1 text-xl">
                                {subSection.name}
                              </CardTitle>
                              {selectedSubSections.includes(subSection.id) ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                            </CardHeader>

                            {selectedSubSections.includes(subSection.id) && (
                              <CardContent className="pt-2 pb-6">
                                <ul className="space-y-3">
                                  {subSection.form_checkbox_group.map(
                                    (selectionGroup) => (
                                      <li
                                        key={selectionGroup.id}
                                        className="flex w-full space-x-2"
                                      >
                                        <Card className="w-2/3">
                                          <CardHeader>
                                            <CardTitle>Tasks</CardTitle>
                                          </CardHeader>
                                          <CardContent></CardContent>
                                        </Card>
                                        <Card className="w-1/3">
                                          <CardHeader>
                                            <CardTitle>
                                              {selectionGroup.name}
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent></CardContent>
                                        </Card>
                                      </li>
                                    )
                                  )}
                                </ul>
                                <ul>
                                  {subSection.form_text_input_field.map(text)}
                                </ul>
                              </CardContent>
                            )}
                          </Card>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
};
