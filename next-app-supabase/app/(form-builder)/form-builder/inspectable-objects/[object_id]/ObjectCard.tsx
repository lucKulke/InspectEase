"use client";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IInspectableObjectProfilePropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectPropertyResponse,
  IInspectableObjectResponse,
  IInspectableObjectWithPropertiesAndProfileResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";

import { redirect } from "next/navigation";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { profileIcons } from "@/lib/availableIcons";
import { UUID } from "crypto";
import { PenLine } from "lucide-react";
import { useState } from "react";
import { updateObjectProperty } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { useRouter } from "next/navigation";

interface ObjectCardProps {
  objectInfo: IInspectableObjectWithPropertiesAndProfileResponse[] | null;
  objectProfileProps: IInspectableObjectProfilePropertyResponse[] | null;
}

export const ObjectCard = ({
  objectInfo,
  objectProfileProps,
}: ObjectCardProps) => {
  const { showNotification } = useNotification();
  const router = useRouter();
  if (!objectInfo || !objectProfileProps) return <div>No Data...</div>;

  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [selectObjectPropId, setSelectObjectPropId] = useState<UUID>();
  const [currentObjectPropValue, setCurrentObjectPropValue] =
    useState<string>("");
  const [oldObjectPropValue, setOldObjectPropValue] = useState<string>();

  const objectProps: Record<UUID, IInspectableObjectPropertyResponse> = {};
  objectInfo[0].inspectable_object_property.forEach((objectProp) => {
    objectProps[objectProp.profile_property_id] = objectProp;
  });

  const handleUpdateProp = async () => {
    setOpenUpdateDialog(false);
    if (!selectObjectPropId) return;

    const {
      updatedInspectableObjectProperty,
      updatedInspectableObjectPropertyError,
    } = await updateObjectProperty(selectObjectPropId, {
      value: currentObjectPropValue,
    });

    if (updatedInspectableObjectPropertyError) {
      showNotification(
        "Update object prop",
        `Error: ${updatedInspectableObjectPropertyError.message} (${updatedInspectableObjectPropertyError.code})`,
        "error"
      );
      return;
    }

    showNotification(
      "Update object prop",
      `Successfully updated '${currentObjectPropValue}' to '${updatedInspectableObjectProperty?.value}'`,
      "info"
    );

    router.refresh();
  };

  function compare(
    a: IInspectableObjectProfilePropertyResponse,
    b: IInspectableObjectProfilePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <div>
      <Card className="w-1/2">
        <div className="flex justify-between">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>all the objects metadata</CardDescription>
          </CardHeader>
          <div className="m-7">
            {profileIcons[objectInfo[0].inspectable_object_profile.icon_key]}
          </div>
        </div>
        <CardContent className="space-y-5">
          <ul className="space-y-4">
            {objectProfileProps.sort(compare).map((profileProp) => (
              <li key={profileProp.id} className="flex group space-x-2">
                <h2 className="font-bold">{profileProp.name}:</h2>
                <p>{objectProps[profileProp.id].value}</p>
                <button
                  onClick={() => {
                    setOpenUpdateDialog(true);
                    setSelectObjectPropId(objectProps[profileProp.id].id);
                    setOldObjectPropValue(objectProps[profileProp.id].value);
                    setCurrentObjectPropValue(
                      objectProps[profileProp.id].value
                    );
                  }}
                >
                  <PenLine
                    className="opacity-0 group-hover:opacity-100"
                    size={20}
                  ></PenLine>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update</DialogTitle>
            <DialogDescription>Update the current value</DialogDescription>
          </DialogHeader>
          <Label>
            Value
            <Input
              value={currentObjectPropValue}
              onChange={(e) => setCurrentObjectPropValue(e.target.value)}
            ></Input>
          </Label>
          <DialogFooter>
            {oldObjectPropValue !== currentObjectPropValue ? (
              <Button
                onClick={() => {
                  handleUpdateProp();
                }}
              >
                Save changes
              </Button>
            ) : (
              <Button variant="outline">Save changes</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
