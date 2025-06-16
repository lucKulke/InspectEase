"use client";
import React, { useEffect } from "react";

import {
  IInspectableObjectInspectionFormPropertyResponse,
  IInspectableObjectInspectionFormResponse,
  IInspectableObjectInspectionFormWithProps,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileFormTypeWithProps,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { useState } from "react";
import { Cog, Plus } from "lucide-react";
import Link from "next/link";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { randomUUID, UUID } from "crypto";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { InspectionPlanTable } from "./InspectionPlanTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profileIcons } from "@/lib/availableIcons";
import { Button } from "@/components/ui/button";

interface InspectionPlanTypesProps {
  objectId: UUID;
  inspectionFormsWithProps: IInspectableObjectInspectionFormWithProps[];
  profileFormTypes: IInspectableObjectProfileFormTypeWithProps[];
}

export const InspectionPlanTypes = ({
  inspectionFormsWithProps,
  profileFormTypes,
  objectId,
}: InspectionPlanTypesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabFromUrl || profileFormTypes[0].id
  );

  useEffect(() => {
    if (tabFromUrl !== activeTab) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("tab", activeTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [activeTab]);

  return (
    <div className="">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-4 flex justify-between">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className=" max-w-sm w-52">
              <SelectValue placeholder="Select profile" />
            </SelectTrigger>
            <SelectContent>
              {profileFormTypes.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center space-x-2">
                    <p> {profile.name}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() =>
              router.push(
                formBuilderLinks["inspectableObjects"].href +
                  "/" +
                  objectId +
                  "/inspection-forms/create?tab=" +
                  activeTab
              )
            }
          >
            <Plus />
            Create
          </Button>
        </div>
        {profileFormTypes.map((type) => {
          return (
            <TabsContent key={type.id} value={type.id}>
              <InspectionPlanTable
                formTypeProps={
                  type.inspectable_object_profile_form_type_property
                }
                inspectionPlans={inspectionFormsWithProps.filter(
                  (inspectionForm) => inspectionForm.form_type_id === type.id
                )}
              ></InspectionPlanTable>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
