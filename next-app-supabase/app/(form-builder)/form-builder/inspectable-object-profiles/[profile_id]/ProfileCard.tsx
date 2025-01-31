"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { useNotification } from "@/app/context/NotificationContext";

import {
  IInspectableObjectProfilePropertyResponse,
  IInspectableObjectProfileResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";

import { redirect } from "next/navigation";
import { profileIcons } from "@/lib/availableIcons";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { useEffect, useState } from "react";
import { IInspectableObjectProfilePropertyInsert } from "@/lib/database/form-builder/formBuilderInterfaces";
import { createProfileProperty } from "./actions";

import { DragAndDropPropertyList } from "./DragAndDropPropertyList";

interface ProfileCardProps {
  profileData: IInspectableObjectProfileResponse | null;
  profileDataError: SupabaseError | null;
  profilePropertys: IInspectableObjectProfilePropertyResponse[];
  profilePropertysError: SupabaseError | null;
}

export const ProfileCard = ({
  profileData,
  profileDataError,
  profilePropertys,
  profilePropertysError,
}: ProfileCardProps) => {
  const { showNotification } = useNotification();

  const [openAddPropertyDialog, setOpenAddPropertyDialog] =
    useState<boolean>(false);
  const [profilePropertyList, setProfilePropertyList] =
    useState<IInspectableObjectProfilePropertyResponse[]>(profilePropertys);
  const [propertyName, setPropertyName] = useState<string>("");
  const [propertyDescription, setPropertyDescription] = useState<string>("");

  if (profileDataError && profileData === null) {
    showNotification(
      "fetching profile",
      `Error: ${profileDataError.message} (${profileDataError.code})`,
      "error"
    );
    redirect(formBuilderLinks["inspectableObjectProfiles"].href);
  }

  if (profilePropertysError) {
    showNotification(
      "fetching profile propertys",
      `Error: ${profilePropertysError.message} (${profilePropertysError.code})`,
      "error"
    );
    redirect(formBuilderLinks["inspectableObjectProfiles"].href);
  }

  useEffect(() => {
    if (!openAddPropertyDialog) {
      setPropertyName("");
      setPropertyDescription("");
    }
  }, [openAddPropertyDialog]);

  const handleCreateProperty = async (
    property: IInspectableObjectProfilePropertyInsert
  ) => {
    console.log("propety", property);
    const {
      inspectableObjectProfileProperty,
      inspectableObjectProfilePropertyError,
    } = await createProfileProperty(property);

    if (inspectableObjectProfilePropertyError) {
      showNotification(
        "Create property",
        `Error: ${inspectableObjectProfilePropertyError.message} (${inspectableObjectProfilePropertyError.code})`,
        "error"
      );
      return;
    }

    showNotification(
      "Create property",
      `Successfully created profile property with id '${inspectableObjectProfileProperty.id}'`,
      "info"
    );

    setProfilePropertyList([
      ...profilePropertyList,
      inspectableObjectProfileProperty,
    ]);
  };

  return (
    <>
      <Card className="w-1/2">
        <div className="flex justify-between items-center">
          <CardHeader>
            <CardTitle>{profileData?.name}</CardTitle>
            <CardDescription>{profileData?.description}</CardDescription>
          </CardHeader>
          <div className="m-7">
            {profileData?.icon_key && profileIcons[profileData.icon_key]}
          </div>
        </div>
        <CardContent className="space-y-5">
          <div className="flex justify-between mt-8">
            <p className="text-sm text-slate-600">Additional propertys</p>
            <Button onClick={() => setOpenAddPropertyDialog(true)}>Add</Button>
          </div>

          <DragAndDropPropertyList
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
    </>
  );
};
