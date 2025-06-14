"use client";
import React, { useEffect } from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IInspectableObjectInspectionFormPropertyResponse,
  IInspectableObjectInspectionFormResponse,
  IInspectableObjectInspectionFormWithProps,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileFormTypeWithProps,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { useState } from "react";
import { Cog } from "lucide-react";
import Link from "next/link";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { randomUUID, UUID } from "crypto";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";

import { SelectForm } from "./SelectForm";

interface InspectionPlanTypesProps {
  inspectionFormsWithProps: IInspectableObjectInspectionFormWithProps[];
  profileFormTypes: IInspectableObjectProfileFormTypeWithProps[];
  selectedGroup: string;
  selectedObject: string;
  handleSelect: (id: string) => void;
}

export const SelectFormTypes = ({
  inspectionFormsWithProps,
  profileFormTypes,
  selectedGroup,
  selectedObject,
  handleSelect,
}: InspectionPlanTypesProps) => {
  const [activeTab, setActiveTab] = useState(
    profileFormTypes.filter((type) => type.profile_id === selectedGroup)[0]
      .id as string
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="p-2">
      <TabsList className="mb-4">
        {profileFormTypes
          .filter((type) => type.profile_id === selectedGroup)
          .map((type) => {
            return (
              <TabsTrigger key={type.id} value={type.id} className="space-x-2">
                <p>{type.name}</p>
              </TabsTrigger>
            );
          })}
      </TabsList>
      {profileFormTypes
        .filter((type) => type.profile_id === selectedGroup)
        .map((type) => {
          return (
            <TabsContent key={type.id} value={type.id}>
              <SelectForm
                handleSelect={handleSelect}
                formTypeProps={
                  type.inspectable_object_profile_form_type_property
                }
                inspectionPlans={inspectionFormsWithProps.filter(
                  (inspectionForm) =>
                    inspectionForm.form_type_id === type.id &&
                    inspectionForm.object_id === selectedObject
                )}
              ></SelectForm>
            </TabsContent>
          );
        })}
    </Tabs>
  );
};
