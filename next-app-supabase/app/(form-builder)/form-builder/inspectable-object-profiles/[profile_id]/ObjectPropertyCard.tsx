"use client";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  IInspectableObjectProfileObjPropertyInsert,
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileWithObjProperties,
} from "@/lib/database/form-builder/formBuilderInterfaces";

import { profileIcons } from "@/lib/availableIcons";
import { createProfileObjProperty } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { DraggableObjPropertyList } from "./DraggableObjPropertyList";
import { useRouter } from "next/navigation";

interface ObjectPropertyCard {
  profileData: IInspectableObjectProfileWithObjProperties;
}

export const ObjectPropertyCard = ({ profileData }: ObjectPropertyCard) => {
  const { showNotification } = useNotification();
  const router = useRouter();

  const [openAddPropertyDialog, setOpenAddPropertyDialog] =
    useState<boolean>(false);
  const [profilePropertyList, setProfilePropertyList] = useState<
    IInspectableObjectProfileObjPropertyResponse[]
  >(profileData?.inspectable_object_profile_obj_property);
  const [propertyName, setPropertyName] = useState<string>("");
  const [propertyDescription, setPropertyDescription] = useState<string>("");

  const handleCreateProperty = async (
    property: IInspectableObjectProfileObjPropertyInsert
  ) => {
    console.log("propety", property);
    const {
      inspectableObjectProfileObjProperty,
      inspectableObjectProfileObjPropertyError,
    } = await createProfileObjProperty(property);

    if (inspectableObjectProfileObjPropertyError) {
      showNotification(
        "Create obj property",
        `Error: ${inspectableObjectProfileObjPropertyError.message} (${inspectableObjectProfileObjPropertyError.code})`,
        "error"
      );
      return;
    }

    showNotification(
      "Create property",
      `Successfully created profile obj property with id '${inspectableObjectProfileObjProperty.id}'`,
      "info"
    );

    setProfilePropertyList([
      ...profilePropertyList,
      inspectableObjectProfileObjProperty,
    ]);
    router.refresh();
  };

  return (
    <div>
      <Card className="min-w-[500px]">
        <CardHeader>
          <CardTitle>Object properties</CardTitle>
          <CardDescription>
            All properties that are needed to identify the object
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex justify-between mt-8">
            <p className="text-sm text-slate-600">Propertys</p>
            <Button onClick={() => setOpenAddPropertyDialog(true)}>
              Create
            </Button>
          </div>

          <DraggableObjPropertyList
            propertyList={profilePropertyList}
            setPropertyList={setProfilePropertyList}
          />
        </CardContent>
      </Card>
      <Dialog
        open={openAddPropertyDialog}
        onOpenChange={setOpenAddPropertyDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add property</DialogTitle>
            <DialogDescription>Add a new profile property</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propertyName" className="text-right">
                Name
              </Label>
              <Input
                id="propertyName"
                value={propertyName} // Controlled input
                onChange={(e) => setPropertyName(e.target.value)} // Update state on input change
                className="col-span-3"
              />
              <Label htmlFor="newPorfileDescription" className="text-right">
                Description
              </Label>
              <Input
                id="newPorfileDescription"
                value={propertyDescription} // Controlled input
                onChange={(e) => setPropertyDescription(e.target.value)} // Update state on input change
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            {propertyName.length > 1 && propertyDescription.length > 1 ? (
              <Button
                onClick={() => {
                  if (!profileData) return;
                  handleCreateProperty({
                    name: propertyName,
                    description: propertyDescription,
                    profile_id: profileData.id,
                    order_number: profilePropertyList.length + 1,
                  });
                }}
              >
                Save changes
              </Button>
            ) : (
              <Button disabled variant="outline">
                Save changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
