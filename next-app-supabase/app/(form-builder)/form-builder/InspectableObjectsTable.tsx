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
import { IInspectableObjectsResponse } from "@/lib/database/formBuilderInterfaces";
import { useNotification } from "@/app/context/NotificationContext";
import { getUser } from "@/utils/supabase/getUser";
import { redirect } from "next/navigation";

const objectTypes: Record<string, any> = {
  motorbike: <Bike />,
  car: <Car />,
  truck: <Truck />,
};

interface InspectableObjectsTableProps {}

export const InspectableObjectsTable = ({}: InspectableObjectsTableProps) => {
  const { showNotification } = useNotification();

  const [objects, setObjects] = useState<IInspectableObjectsResponse[]>([]);
  const getInspectableObjects = async () => {
    const user = await getUser();

    if (!user) {
      redirect("/login");
    }

    const { inspectableObjects, inspectableObjectsError } =
      await fetchInspectableObjects(user.id);

    if (inspectableObjectsError) {
      showNotification(
        "Inspectable Objects",
        `Error: ${inspectableObjectsError}`,
        "error"
      );
    }
    setObjects(inspectableObjects);
  };

  useEffect(() => {
    getInspectableObjects();
  }, []);

  return (
    <Table>
      <TableCaption>A list of your vehicles.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {objects.map((object) => (
          <TableRow key={object.id}>
            <TableCell>{objectTypes[object.type]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
