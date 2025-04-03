import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  return (
    <Tabs defaultValue="objectProps" className="w-full mt-5">
      <TabsList className="mb-2">
        <TabsTrigger value="objectProps">Object properties</TabsTrigger>
        <TabsTrigger value="formConfig">Form Config</TabsTrigger>
        <TabsTrigger value="stringExtractionTraining">
          String Extraction Training
        </TabsTrigger>
      </TabsList>

      <TabsContent value="objectProps">
        <ObjectPropertyCard
          profileData={inspectableObjectProfileWithObjProps}
        ></ObjectPropertyCard>
      </TabsContent>
      <TabsContent value="formConfig">
        <FormConfigCard
          profileId={profileId}
          formTypes={inspectableObjectProfileFormTypes}
        ></FormConfigCard>
      </TabsContent>
      <TabsContent value="stringExtractionTraining">
        <StringExtractionTrainingList
          trainingList={stringExtractionTrainings}
          profileId={profileId}
        ></StringExtractionTrainingList>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileData;
