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

import { useNotification } from "@/app/context/NotificationContext";

import { IInspectableObjectProfileResponse } from "@/lib/database/formBuilderInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";

import { redirect } from "next/navigation";

interface ProfileCardProps {
  profileData: IInspectableObjectProfileResponse | null;
  profileDataError: SupabaseError | null;
}

export const ProfileCard = ({
  profileData,
  profileDataError,
}: ProfileCardProps) => {
  const { showNotification } = useNotification();

  if (profileDataError && profileData === null) {
    showNotification(
      "fetching Profile",
      `Error: ${profileDataError.message} (${profileDataError.code})`,
      "error"
    );
    redirect("/");
  }

  return (
    <Card className="w-1/2">
      <div className="flex justify-between items-center">
        <CardHeader>
          <CardTitle>{profileData?.name}</CardTitle>
          <CardDescription>{profileData?.description}</CardDescription>
        </CardHeader>
      </div>
      <CardContent className="space-y-5">
        <div className="flex justify-between">
          <p className="text-sm text-slate-600">Additional propertys</p>
          <Button>Add</Button>
        </div>

        <Table>
          <TableCaption>A list of your profiles.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody></TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
