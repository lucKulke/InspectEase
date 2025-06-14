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
import { InspectionPlanTable } from "./InspectionPlanTable";

interface InspectionPlanTypesProps {
  inspectionFormsWithProps: IInspectableObjectInspectionFormWithProps[];
  profileFormTypes: IInspectableObjectProfileFormTypeWithProps[];
}

export const InspectionPlanTypes = ({
  inspectionFormsWithProps,
  profileFormTypes,
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
        <TabsList className="mb-4">
          {profileFormTypes.map((type) => {
            return (
              <TabsTrigger key={type.id} value={type.id} className="space-x-2">
                <p>{type.name}</p>
              </TabsTrigger>
            );
          })}
        </TabsList>
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
