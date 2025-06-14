"use client";
import { useNotification } from "@/app/context/NotificationContext";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { profileIcons, IconType } from "@/lib/availableIcons";
import { useState } from "react";
import { updateProfile } from "./actions";
import { UUID } from "crypto";
import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconSelector } from "@/components/IconSelector";
type UpdateableMetadata = "Name" | "Description" | "Icon";

interface MetadataCardProps {
  profileId: UUID;
  name: string;
  description: string;
  icon_key: IconType;
}

export const MetadataCard = ({
  name,
  description,
  icon_key,
  profileId,
}: MetadataCardProps) => {
  const { showNotification } = useNotification();
  const [profileName, setProfileName] = useState<string>(name);
  const [profileDescription, setProfileDescription] =
    useState<string>(description);
  const [profileIconKey, setProfileIconKey] = useState<IconType>(icon_key);

  const [updateProp, setUpdateProp] = useState<UpdateableMetadata | null>(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleUpdateProfile();
      setOpenUpdateDialog(false);
    }
  };

  const handleUpdateProfile = async (icon_key: IconType = profileIconKey) => {
    const {
      updatedInspectableObjectProfile,
      updatedInspectableObjectProfileError,
    } = await updateProfile(profileId, {
      name: profileName,
      description: profileDescription,
      icon_key: icon_key,
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
  };

  const handleChangeIcon = async (key: IconType) => {
    setProfileIconKey(key);

    await handleUpdateProfile(key);
  };

  return (
    <>
      <Card className="max-w-[400px] mt-2">
        <div className="flex justify-between items-center">
          <CardHeader>
            <div className="flex space-x-2 items-center group">
              <CardTitle>{profileName}</CardTitle>{" "}
              <Button
                variant={"ghost"}
                onClick={() => {
                  setUpdateProp("Name");
                  setOpenUpdateDialog(true);
                }}
              >
                <Edit3
                  className="opacity-0 group-hover:opacity-100"
                  size={25}
                />
              </Button>
            </div>
            <div className="flex space-x-2 items-center group">
              <CardDescription>{profileDescription}</CardDescription>
              <Button
                variant={"ghost"}
                onClick={() => {
                  setUpdateProp("Description");
                  setOpenUpdateDialog(true);
                }}
              >
                <Edit3
                  className="opacity-0 group-hover:opacity-100"
                  size={25}
                />
              </Button>
            </div>
          </CardHeader>
          <IconSelector
            onSelect={handleChangeIcon}
            currentIcon={profileIconKey}
          />
        </div>
      </Card>
      <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit {updateProp}</DialogTitle>
          </DialogHeader>

          {updateProp === "Name" ? (
            <div>
              <Label htmlFor="name">{updateProp}</Label>
              <Input
                id="name"
                name="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="description">{updateProp}</Label>
              <Input
                id="description"
                name="description"
                value={profileDescription}
                onChange={(e) => setProfileDescription(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                handleUpdateProfile();
                setOpenUpdateDialog(false);
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
