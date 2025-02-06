"use client";

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

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectPropertyResponse,
  IInspectableObjectWithPropertiesResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { UUID } from "crypto";
import React, { useState } from "react";
import Link from "next/link";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { Cog, Trash2 } from "lucide-react";
import { deleteObject } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

interface InspectableObjectsTableProps {
  profileProps: IInspectableObjectProfileObjPropertyResponse[];
  tempPropOrder: Record<UUID, number>;
  objectsWithProps: IInspectableObjectWithPropertiesResponse[];
  profile: IInspectableObjectProfileResponse;
}

export const InspectableObjectsTable = ({
  profileProps,
  tempPropOrder,
  objectsWithProps,
  profile,
}: InspectableObjectsTableProps) => {
  const { showNotification } = useNotification();
  const [objects, setObjects] =
    useState<IInspectableObjectWithPropertiesResponse[]>(objectsWithProps);
  const [openDeleteAlertDialog, setOpenDeleteAlertDialog] =
    useState<boolean>(false);
  const [selectedObjectId, setSelectedObjectId] = useState<UUID>();

  const handleDeleteObject = async (objectId: UUID) => {
    const { inspectableObject, inspectableObjectError } = await deleteObject(
      objectId
    );

    if (inspectableObjectError) {
      showNotification(
        "Delete object",
        `Error: ${inspectableObjectError.message} (${inspectableObjectError.code})`,
        "error"
      );
      return;
    }

    if (!inspectableObject) {
      showNotification("Delete object", "Error: Unknown", "error");
      return;
    }
    setObjects(objects.filter((obj) => obj.id !== inspectableObject.id));
    showNotification(
      "Delete object",
      `Successfully deleted object with id '${inspectableObject.id}'`,
      "info"
    );
  };

  function compareProfileProps(
    a: IInspectableObjectProfileObjPropertyResponse,
    b: IInspectableObjectProfileObjPropertyResponse
  ) {
    if (a.order_number > b.order_number) return 1;
    if (a.order_number < b.order_number) return -1;
    return 0;
  }

  function compareObjectProps(
    a: IInspectableObjectPropertyResponse,
    b: IInspectableObjectPropertyResponse
  ) {
    if (
      tempPropOrder[a.profile_property_id] <
      tempPropOrder[b.profile_property_id]
    )
      return -1;

    if (
      tempPropOrder[a.profile_property_id] >
      tempPropOrder[b.profile_property_id]
    )
      return 1;

    return 0;
  }

  return (
    <div>
      <ScrollArea className="h-80 border-2 border-black rounded-lg p-4">
        <Table>
          <TableCaption>
            A list of your {profile.name.toLowerCase()} objects.
          </TableCaption>
          <TableHeader>
            <TableRow>
              {profileProps.sort(compareProfileProps).map((profileProp) => (
                <TableCell key={profileProp.id}>{profileProp.name}</TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {objects.map((object) => (
              <TableRow key={object.id}>
                {object.inspectable_object_property
                  .sort(compareObjectProps)
                  .map((objectProp) => (
                    <TableCell key={objectProp.id}>
                      {objectProp.value}
                    </TableCell>
                  ))}
                <TableCell>
                  <div className="flex justify-end space-x-3">
                    <Link
                      href={
                        formBuilderLinks["inspectableObjects"].href +
                        "/" +
                        object.id
                      }
                    >
                      <Cog></Cog>
                    </Link>

                    <button
                      onClick={() => {
                        setSelectedObjectId(object.id);
                        setOpenDeleteAlertDialog(true);
                      }}
                      className=" text-red-500"
                    >
                      <Trash2></Trash2>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <AlertDialog
        open={openDeleteAlertDialog}
        onOpenChange={setOpenDeleteAlertDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              object and remove all its data from our servers (including
              inspection plans).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedObjectId) handleDeleteObject(selectedObjectId);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
