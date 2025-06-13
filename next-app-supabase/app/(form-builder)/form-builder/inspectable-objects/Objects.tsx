"use client";
import { ErrorHandler } from "@/components/ErrorHandler";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import {
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectWithPropertiesResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { InspectableObjectsTable } from "./InspectableObjectsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconType, profileIcons } from "@/lib/availableIcons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ObjectsProps {
  profiles: IInspectableObjectProfileResponse[];
  objects: Record<
    string,
    {
      profileProps: IInspectableObjectProfileObjPropertyResponse[];
      objectsWithProps: IInspectableObjectWithPropertiesResponse[];
    }
  >;
}

export const Objects = ({ profiles, objects }: ObjectsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || profiles[0].id);

  useEffect(() => {
    if (tabFromUrl !== activeTab) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("tab", activeTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [activeTab]);

  return (
    <div className="m-10">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {profiles.map((profile) => {
            return (
              <TabsTrigger
                key={profile.id}
                value={profile.id}
                className="space-x-2"
              >
                {profileIcons[profile.icon_key as IconType]}
                <p>{profile.name}</p>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {profiles.map((profile) => {
          const inspectableObjectProfilePropertys =
            objects[profile.id].profileProps;
          const inspectableObjectsWitProps =
            objects[profile.id].objectsWithProps;
          return (
            <TabsContent key={profile.id} value={profile.id}>
              <InspectableObjectsTable
                profile={profile}
                profileProps={inspectableObjectProfilePropertys}
                objectsWithProps={inspectableObjectsWitProps}
              ></InspectableObjectsTable>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
