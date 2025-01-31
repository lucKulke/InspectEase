"use client";
import React, { useEffect, useState } from "react";
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
import { createClient } from "@/utils/supabase/server";
import { Bike, Car, Truck, Cog, Plus } from "lucide-react";
import { fetchInspectableObjects } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

import { IInspectableObjectResponse } from "@/lib/database/formBuilderInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";

const objectTypes: Record<string, any> = {
  motorbike: <Bike />,
  car: <Car />,
  truck: <Truck />,
};

interface InspectableObjectsTableProps {
  inspectableObjects: IInspectableObjectResponse[];
  inspectableObjectsError: SupabaseError | null;
}

export const InspectableObjectsTable = ({
  inspectableObjects,
  inspectableObjectsError,
}: InspectableObjectsTableProps) => {
  const { showNotification } = useNotification();
  if (inspectableObjectsError) {
    showNotification(
      "Objects",
      `Error: ${inspectableObjectsError.message} (${inspectableObjectsError.code})`,
      "error"
    );
  }

  return (
    <Table>
      <TableCaption>A list of your objects.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inspectableObjects.map((object) => (
          <TableRow key={object.id}>
            <TableCell>{objectTypes[object.type]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
