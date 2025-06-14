"use client";

import { useState } from "react";
import { DynamicTable, type ColumnDef } from "@/components/MainTable";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IInspectableObjectProfileResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";
import { IconType, profileIcons } from "@/lib/availableIcons";
import { deleteProfiles } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { UUID } from "crypto";

interface ObjectProfilesTableProps {
  inspectableObjectProfiles: IInspectableObjectProfileResponse[];
  inspectableObjectProfilesError: SupabaseError | null;
}

export const ObjectProfilesTable = ({
  inspectableObjectProfiles,
  inspectableObjectProfilesError,
}: ObjectProfilesTableProps) => {
  const { showNotification } = useNotification();
  // Example column definitions
  const [data, setData] = useState(inspectableObjectProfiles);
  const [columns, setColumns] = useState<ColumnDef[]>([
    {
      key: "icon_key",
      header: "Icon",
      sortable: false,
      cell: (value) => <div>{profileIcons[value as IconType]}</div>,
      className: "text-left w-20",
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "text-left ",
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
    },
    {
      key: "created_at",
      header: "Created At",
      sortable: true,
      className: "text-left",
      cell: (value) => new Date(value).toISOString(),
    },
    {
      key: "updated_at",
      header: "Updated At",
      sortable: true,
      className: "text-left",
      cell: (value) => new Date(value).toISOString(),
    },
    {
      key: "object_count",
      header: "Objects",
      sortable: true,
      className: "text-right",
    },
    // {
    //   key: "role",
    //   header: "Role",
    //   sortable: true,
    //   //   cell: (value) => (
    //   //     <Badge variant={value === "Admin" ? "default" : "secondary"}>
    //   //       {value}
    //   //     </Badge>
    //   //   ),
    // },
    // {
    //   key: "status",
    //   header: "Status",
    //   sortable: true,
    //   cell: (value) => (
    //     <Badge variant={value === "Active" ? "success" : "destructive"}>
    //       {value}
    //     </Badge>
    //   ),
    // },
    // {
    //   key: "lastLogin",
    //   header: "Last Login",
    //   sortable: true,
    // },
  ]);

  // Example data

  //[
  // {
  //   id: 1,
  //   name: "John Doe",
  //   email: "john@example.com",
  //   role: "Admin",
  //   status: "Active",
  //   lastLogin: "2023-06-10",
  // },
  // {
  //   id: 2,
  //   name: "Jane Smith",
  //   email: "jane@example.com",
  //   role: "User",
  //   status: "Inactive",
  //   lastLogin: "2023-05-22",
  // },
  // {
  //   id: 3,
  //   name: "Alice Johnson",
  //   email: "alice@example.com",
  //   role: "User",
  //   status: "Active",
  //   lastLogin: "2023-06-11",
  // },
  // {
  //   id: 4,
  //   name: "Bob Williams",
  //   email: "bob@example.com",
  //   role: "Admin",
  //   status: "Active",
  //   lastLogin: "2023-06-09",
  // },
  // {
  //   id: 5,
  //   name: "Charlie Brown",
  //   email: "charlie@example.com",
  //   role: "User",
  //   status: "Inactive",
  //   lastLogin: "2023-04-15",
  // },
  //]

  const handleDelete = async (profileId: string[]) => {
    const {
      deletedInspectableObjectProfile,
      deletedInspectableObjectProfileError,
    } = await deleteProfiles(profileId as UUID[]);

    if (deletedInspectableObjectProfileError) {
      showNotification(
        "Delete profile",
        `Error: ${deletedInspectableObjectProfileError.message} (${deletedInspectableObjectProfileError.code})`,
        "error"
      );
      return;
    }
    showNotification(
      "Delete profile",
      `Successfully deleted selected profiles`,
      "info"
    );
    const deletedIds = deletedInspectableObjectProfile?.map((p) => p.id);
    console.log(deletedIds);

    setData((prev) =>
      prev.filter((profile) => !deletedIds?.includes(profile.id))
    );
  };

  return (
    <DynamicTable
      basePath="/form-builder/inspectable-object-profiles"
      columns={columns}
      data={data}
      onBulkDelete={handleDelete}
    />
  );
};
