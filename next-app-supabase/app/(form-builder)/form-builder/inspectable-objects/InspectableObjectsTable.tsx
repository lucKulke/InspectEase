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
import { deleteObjects } from "./actions";
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
import { ColumnDef, DynamicTable } from "@/components/MainTable";

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

  const objectList = objectsWithProps.map((object) => {
    const newObject: Record<string, string> = {};
    profileProps.sort(compareProfileProps).map((profileProp) => {
      const objProp = object.inspectable_object_property.filter(
        (objProp) => objProp.profile_property_id === profileProp.id
      )[0];

      newObject["id"] = object.id;
      newObject[profileProp.name] = objProp?.value ?? "";
    });
    return newObject;
  });

  console.log("objectList", objectList);

  const [objects, setObjects] = useState<any[]>(objectList);
  const [openDeleteAlertDialog, setOpenDeleteAlertDialog] =
    useState<boolean>(false);
  const [selectedObjectId, setSelectedObjectId] = useState<UUID>();

  const [columns, setColumns] = useState<ColumnDef[]>(
    profileProps.sort(compareProfileProps).map((profileProp) => ({
      key: profileProp.name,
      header: profileProp.name,
      sortable: true,
    }))
  );

  console.log("columns", columns);

  const handleDeleteObjects = async (objectIds: string[]) => {
    const { inspectableObject, inspectableObjectError } = await deleteObjects(
      objectIds as UUID[]
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
      <DynamicTable
        columns={columns}
        data={objects}
        basePath="inspectable-objects"
        onBulkDelete={handleDeleteObjects}
      ></DynamicTable>
    </div>
  );
};
