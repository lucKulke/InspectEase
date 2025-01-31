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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { IInspectableObjectProfileResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";
import Link from "next/link";
import { Ellipsis, Trash2 } from "lucide-react";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { deleteProfile, updateProfile } from "./actions";
import { UUID } from "crypto";
import { revalidatePath } from "next/cache";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconType, profileIcons } from "@/lib/availableIcons";
import { IconSelector } from "@/components/IconSelector";

interface InspectableObjectProfilesTableProps {
  inspectableObjectProfiles: IInspectableObjectProfileResponse[];
  inspectableObjectProfilesError: SupabaseError | null;
}

export const InspectableObjectProfilesTable = ({
  inspectableObjectProfiles,
  inspectableObjectProfilesError,
}: InspectableObjectProfilesTableProps) => {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [objectProfiles, setObjectProfiles] = useState<
    IInspectableObjectProfileResponse[]
  >(inspectableObjectProfiles);
  const [openUpdateProfile, setOpenUpdateProfile] = useState<boolean>(false);
  const [newProfileName, setNewProfileName] = useState<string>("");
  const [currentProfileName, setCurrentProfileName] = useState<string>("");
  const [newProfileDescription, setNewProfileDescription] =
    useState<string>("");
  const [currentProfileDescription, setCurrentProfileDescription] =
    useState<string>("");
  const [newProfileIconKey, setNewProfileIconKey] =
    useState<IconType>("default");
  const [currentProfileIconKey, setCurrentProfileIconKey] =
    useState<IconType>("default");
  const [selectedProfileId, setSelectedProfileId] = useState<UUID>();

  if (inspectableObjectProfilesError) {
    showNotification(
      "Profiles",
      `Error: ${inspectableObjectProfilesError.message} (${inspectableObjectProfilesError.code})`,
      "error"
    );
  }

  const handleDelete = async (profileId: UUID) => {
    const {
      deletedInspectableObjectProfile,
      deletedInspectableObjectProfileError,
    } = await deleteProfile(profileId);

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
      `Successfully deleted profile with id '${deletedInspectableObjectProfile.id}'`,
      "info"
    );

    setObjectProfiles(
      objectProfiles.filter((profile) => profile.id !== profileId)
    );
  };

  const handleUpdateProfile = async (
    profileId: UUID,
    newName: string,
    newDescripiton: string,
    newIconKey: IconType
  ) => {
    const {
      updatedInspectableObjectProfile,
      updatedInspectableObjectProfileError,
    } = await updateProfile(profileId, {
      name: newName,
      description: newDescripiton,
      icon_key: newIconKey,
    });

    if (updatedInspectableObjectProfileError) {
      showNotification(
        "Update profile",
        `Error: ${updatedInspectableObjectProfileError.message} (${updatedInspectableObjectProfileError.code})`,
        "error"
      );
      return;
    }

    showNotification(
      "Update profile",
      `Successfully updated profile with id '${updatedInspectableObjectProfile.id}'`,
      "info"
    );

    setObjectProfiles([
      ...objectProfiles.filter(
        (object) => object.id !== updatedInspectableObjectProfile.id
      ),
      updatedInspectableObjectProfile,
    ]);
  };

  const handleSelectIcon = (key: IconType) => {
    setNewProfileIconKey(key);
  };

  function compare(
    a: IInspectableObjectProfileResponse,
    b: IInspectableObjectProfileResponse
  ) {
    if (a.created_at < b.created_at) return -1;

    if (a.created_at > b.created_at) return 1;

    return 0;
  }

  return (
    <>
      <Table>
        <TableCaption>A list of your profiles.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created at</TableHead>
            <TableHead>Updated at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {objectProfiles.sort(compare).map((profile) => (
            <TableRow key={profile.id}>
              <TableCell>{profileIcons[profile.icon_key]}</TableCell>
              <TableCell>{profile.name}</TableCell>
              <TableCell>{profile.description}</TableCell>
              <TableCell>{profile.created_at as string}</TableCell>
              <TableCell>
                {profile.updated_at ? (profile.updated_at as string) : "Never"}
              </TableCell>
              <TableCell className="flex justify-end">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger>
                    <Ellipsis className="text-slate-500 "></Ellipsis>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onSelect={() => {
                        router.push(
                          formBuilderLinks["inspectableObjectProfiles"].href +
                            "/" +
                            profile.id
                        );
                      }}
                    >
                      view
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setSelectedProfileId(profile.id);
                        setNewProfileName(profile.name);
                        setCurrentProfileName(profile.name);
                        setNewProfileDescription(profile.description);
                        setCurrentProfileDescription(profile.description);
                        setNewProfileIconKey(profile.icon_key);
                        setCurrentProfileIconKey(profile.icon_key);
                        setOpenUpdateProfile(true);
                      }}
                    >
                      update
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onSelect={() => handleDelete(profile.id)}
                    >
                      delete <Trash2></Trash2>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openUpdateProfile} onOpenChange={setOpenUpdateProfile}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update</DialogTitle>
            <DialogDescription>Update profile data</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newProfileName" className="text-right">
                Name
              </Label>
              <Input
                id="newProfileName"
                value={newProfileName} // Controlled input
                onChange={(e) => setNewProfileName(e.target.value)} // Update state on input change
                className="col-span-3"
              />
              <Label htmlFor="newPorfileDescription" className="text-right">
                Description
              </Label>
              <Input
                id="newPorfileDescription"
                value={newProfileDescription} // Controlled input
                onChange={(e) => setNewProfileDescription(e.target.value)} // Update state on input change
                className="col-span-3"
              />
              <Label htmlFor="newPorfileIconKey" className="text-right">
                Icon
              </Label>
              <IconSelector
                currentIcon={newProfileIconKey}
                onSelect={handleSelectIcon}
              />
            </div>
          </div>
          <DialogFooter>
            {newProfileName.length > 1 &&
            newProfileDescription.length > 1 &&
            (newProfileName != currentProfileName ||
              newProfileDescription != currentProfileDescription ||
              newProfileIconKey != currentProfileIconKey) ? (
              <Button
                onClick={() => {
                  if (!selectedProfileId) return;
                  handleUpdateProfile(
                    selectedProfileId,
                    newProfileName,
                    newProfileDescription,
                    newProfileIconKey
                  );
                  setOpenUpdateProfile(false);
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
