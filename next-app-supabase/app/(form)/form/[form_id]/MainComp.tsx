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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

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
    <div className="sm:p-3 xl:p-7">
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
                        <li className={subSection.id} key={subSection.id}>
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
                                <ul>
                                  {subSection.form_checkbox_group.map(
                                    (selectionGroup) => (
                                      <li key={selectionGroup.id}>
                                        <ul className="space-y-2">
                                          <li key={selectionGroup.id}>
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead className="text-left">
                                                    task
                                                  </TableHead>
                                                  {selectionGroup.form_checkbox.map(
                                                    (checkbox) => (
                                                      <TableHead className="text-center w-[100px]">
                                                        {checkbox.label}
                                                      </TableHead>
                                                    )
                                                  )}
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {selectionGroup.form_checkbox_task.map(
                                                  (task) => (
                                                    <TableRow>
                                                      <TableCell className="font-medium text-left py-4">
                                                        {task.description}
                                                      </TableCell>
                                                      {selectionGroup.form_checkbox.map(
                                                        (checkbox) => (
                                                          <TableCell className="font-medium text-center whitespace-nowrap py-4">
                                                            <Checkbox></Checkbox>
                                                          </TableCell>
                                                        )
                                                      )}
                                                    </TableRow>
                                                  )
                                                )}
                                              </TableBody>
                                            </Table>
                                          </li>
                                        </ul>
                                      </li>
                                    )
                                  )}
                                </ul>
                                {subSection.form_text_input_field.length >
                                  0 && (
                                  <ul className="mt-5">
                                    {subSection.form_text_input_field.map(
                                      (inputField) => (
                                        <li key={inputField.id}>
                                          <Card className="p-3 flex justify-between items-center">
                                            <p className="w-2/3">
                                              {inputField.label}
                                            </p>
                                            <Input
                                              className="w-1/3"
                                              placeholder={
                                                inputField.placeholder_text
                                              }
                                            ></Input>
                                          </Card>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
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
