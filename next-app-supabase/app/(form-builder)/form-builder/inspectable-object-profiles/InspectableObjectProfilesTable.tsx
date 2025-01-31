"use client";

import { useNotification } from "@/app/context/NotificationContext";
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

import { IInspectableObjectProfileResponse } from "@/lib/database/formBuilderInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";
import { useEffect, useState } from "react";

interface InspectableObjectProfilesTableProps {
  inspectableObjectProfiles: IInspectableObjectProfileResponse[];
  inspectableObjectProfilesError: SupabaseError | null;
}

export const InspectableObjectProfilesTable = ({
  inspectableObjectProfiles,
  inspectableObjectProfilesError,
}: InspectableObjectProfilesTableProps) => {
  const { showNotification } = useNotification();
  if (inspectableObjectProfilesError) {
    showNotification(
      "Profiles",
      `Error: ${inspectableObjectProfilesError.message} (${inspectableObjectProfilesError.code})`,
      "error"
    );
  }
  return (
    <Table>
      <TableCaption>A list of your profiles.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inspectableObjectProfiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell>{profile.name}</TableCell>
            <TableCell>{profile.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
