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
import { useNotification } from "@/app/context/NotificationContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
  const { showNotification } = useNotification();
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(
    profiles.length === 0
  );

  const [activeTab, setActiveTab] = useState(
    tabFromUrl || (profiles[0] ? profiles[0].id : "")
  );

  // Handle syncing with URL
  useEffect(() => {
    if (tabFromUrl !== activeTab) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("tab", activeTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="mb-4 flex justify-between ">
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
        <Button
          onClick={() =>
            router.push(
              "/form-builder/inspectable-objects/create?tab=" + activeTab || ""
            )
          }
        >
          <Plus />
          Create
        </Button>
      </div>

      {profiles.length === 0 ? (
        <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>No Profiles Available</AlertDialogTitle>
              <AlertDialogDescription>
                To get started, please create a profile. You can return here to
                create objects once your profile is set up.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  router.push("/form-builder/inspectable-object-profiles")
                }
              >
                Continue to Profiles
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        profiles.map((profile) => {
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
              />
            </TabsContent>
          );
        })
      )}
    </Tabs>
  );
};
