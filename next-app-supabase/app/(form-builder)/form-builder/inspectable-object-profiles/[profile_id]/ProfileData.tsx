"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { FormConfigCard } from "./FormConfigCard";
import { ObjectPropertyCard } from "./ObjectPropertyCard";
import { profileIcons } from "@/lib/availableIcons";
import { StringExtractionTrainingList } from "./StringExtractionTrainingList";
import {
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileWithObjProperties,
  IStringExtractionTrainingResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { UUID } from "crypto";
import { useSearchParams, useRouter } from "next/navigation";
import { PanelLeft, Sliders, ScanText } from "lucide-react";

interface ProfileDataProps {
  profileId: UUID;
  stringExtractionTrainings: IStringExtractionTrainingResponse[] | null;
  inspectableObjectProfileFormTypes: IInspectableObjectProfileFormTypeResponse[];
  inspectableObjectProfileWithObjProps: IInspectableObjectProfileWithObjProperties;
}

export const ProfileData = ({
  profileId,
  stringExtractionTrainings,
  inspectableObjectProfileFormTypes,
  inspectableObjectProfileWithObjProps,
}: ProfileDataProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tab from URL or fallback to "objectProps"
  const initialTab = searchParams.get("tab") || "objectProps";
  const [currentTab, setCurrentTab] = useState(initialTab);

  // Update URL on tab change
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    const newParams = new URLSearchParams(Array.from(searchParams.entries()));
    newParams.set("tab", value);
    router.replace(`?${newParams.toString()}`);
  };

  useEffect(() => {
    setCurrentTab(initialTab); // sync on load
  }, [initialTab]);

  return (
    <Tabs
      value={currentTab}
      onValueChange={handleTabChange}
      className="w-full mt-5"
    >
      <TabsList className="mb-2 max-sm:w-full">
        <TabsTrigger
          value="objectProps"
          className=" max-sm:w-full flex items-center gap-2"
        >
          <PanelLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Object Props</span>
        </TabsTrigger>
        <TabsTrigger
          value="formConfig"
          className="max-sm:w-full flex items-center gap-2"
        >
          <Sliders className="h-4 w-4" />
          <span className="hidden sm:inline">Form Config</span>
        </TabsTrigger>
        <TabsTrigger
          value="stringExtractionTraining"
          className="max-sm:w-full flex items-center gap-2"
        >
          <ScanText className="h-4 w-4" />
          <span className="hidden sm:inline">String Extraction Training</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="objectProps">
        <ObjectPropertyCard
          profileData={inspectableObjectProfileWithObjProps}
        />
      </TabsContent>
      <TabsContent value="formConfig">
        <FormConfigCard
          profileId={profileId}
          formTypes={inspectableObjectProfileFormTypes}
        />
      </TabsContent>
      <TabsContent value="stringExtractionTraining">
        <StringExtractionTrainingList
          trainingList={stringExtractionTrainings}
          profileId={profileId}
        />
      </TabsContent>
    </Tabs>
  );
};
