"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IInspectableObjectProfileResponse,
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectWithPropertiesResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { IconType, profileIcons } from "@/lib/availableIcons";
import { InspectableObjectsTable } from "./InspectableObjectsTable";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const tabsListRef = useRef<HTMLDivElement>(null);
  // const [isOverflowing, setIsOverflowing] = useState(false);

  // Handle syncing with URL
  useEffect(() => {
    if (tabFromUrl !== activeTab) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("tab", activeTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [activeTab]);

  // Detect overflow on resize
  // useEffect(() => {
  //   const checkOverflow = () => {
  //     if (tabsListRef.current && containerRef.current) {
  //       const listWidth = tabsListRef.current.scrollWidth;
  //       const containerWidth = containerRef.current.offsetWidth;
  //       setIsOverflowing(listWidth > containerWidth);
  //     }
  //   };

  //   checkOverflow();
  //   window.addEventListener("resize", checkOverflow);
  //   return () => window.removeEventListener("resize", checkOverflow);
  // }, [profiles]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="mb-4 ">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className=" max-w-sm w-52">
            <SelectValue placeholder="Select profile" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                <div className="flex items-center space-x-2">
                  <p>{profileIcons[profile.icon_key as IconType]}</p>
                  <p> {profile.name}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {profiles.map((profile) => {
        const inspectableObjectProfilePropertys =
          objects[profile.id].profileProps;
        const inspectableObjectsWitProps = objects[profile.id].objectsWithProps;
        return (
          <TabsContent key={profile.id} value={profile.id}>
            <InspectableObjectsTable
              profile={profile}
              profileProps={inspectableObjectProfilePropertys}
              objectsWithProps={inspectableObjectsWitProps}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
