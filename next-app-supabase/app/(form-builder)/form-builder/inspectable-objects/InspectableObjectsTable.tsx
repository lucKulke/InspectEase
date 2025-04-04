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

import React, { useState } from "react";
import Link from "next/link";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { Cog, Ellipsis, Trash2 } from "lucide-react";
import { deleteObject } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { UUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";

interface InspectableObjectsTableProps {
  profileProps: IInspectableObjectProfileObjPropertyResponse[];

  objectsWithProps: IInspectableObjectWithPropertiesResponse[];
  profile: IInspectableObjectProfileResponse;
}

export const InspectableObjectsTable = ({
  profileProps,
  objectsWithProps,
  profile,
}: InspectableObjectsTableProps) => {
  const router = useRouter();
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
                <TableCell key={profileProp.id} className="font-bold">
                  {profileProp.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {objects.map((object) => {
              return (
                <TableRow key={object.id}>
                  {profileProps.sort(compareProfileProps).map((profileProp) => {
                    const objProp = object.inspectable_object_property.filter(
                      (objProp) =>
                        objProp.profile_property_id === profileProp.id
                    )[0];

                    return objProp ? (
                      <TableCell key={objProp.id}>{objProp.value}</TableCell>
                    ) : (
                      <TableCell key={uuidv4()}></TableCell>
                    );
                  })}
                  <TableCell key={uuidv4()} className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Ellipsis className="text-slate-500 "></Ellipsis>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => {
                            router.push(
                              formBuilderLinks["inspectableObjects"].href +
                                "/" +
                                object.id
                            );
                          }}
                        >
                          view
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => {
                            setOpenDeleteAlertDialog(true);
                            setSelectedObjectId(object.id);
                          }}
                        >
                          delete <Trash2></Trash2>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
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
