"use client";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  IInspectableObjectProfileFormPropertyInsert,
  IInspectableObjectProfileFormPropertyResponse,
  IInspectableObjectProfileFormTypeInsert,
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileFormTypesWithProperties,
  IInspectableObjectProfileObjPropertyInsert,
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileWithFormProperties,
  IInspectableObjectProfileWithObjProperties,
} from "@/lib/database/form-builder/formBuilderInterfaces";

import { profileIcons } from "@/lib/availableIcons";
import {
  createFormType,
  createProfileFormProperty,
  deleteFormType,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { DraggableObjPropertyList } from "./DraggableObjPropertyList";
import { DraggableFormTypePropList } from "./DraggableFormTypePropList";
import { UUID } from "crypto";
import { Ellipsis, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormConfigCardProps {
  profileId: UUID;
  formTypes: IInspectableObjectProfileFormTypeResponse[];
}

export const FormConfigCard = ({
  formTypes,
  profileId,
}: FormConfigCardProps) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [openCreateFormTypeDialog, setOpenCreateFormTypeDialog] =
    useState<boolean>(false);

  const [formTypeName, setFormTypeName] = useState<string>("");
  const [formTypeDescription, setFormTypeDescription] = useState<string>("");
  const [formTypesList, setFormTypesList] =
    useState<IInspectableObjectProfileFormTypeResponse[]>(formTypes);

  const handleCreateFormType = async (
    newFormType: IInspectableObjectProfileFormTypeInsert
  ) => {
    setOpenCreateFormTypeDialog(false);
    const {
      inspectableObjectProfileFormType,
      inspectableObjectProfileFormTypeError,
    } = await createFormType(newFormType);

    if (inspectableObjectProfileFormType) {
      setFormTypesList([...formTypesList, inspectableObjectProfileFormType]);
      router.refresh();
    }
  };

  const handleDeleteFormType = async (formTypeId: UUID) => {
    const { deletedProfileFormType, deletedProfileFormTypeError } =
      await deleteFormType(formTypeId);

    if (deletedProfileFormTypeError) {
      showNotification(
        "Delete form type",
        `Error: ${deletedProfileFormTypeError.message} (${deletedProfileFormTypeError.code})`,
        "error"
      );
      return;
    }

    if (deletedProfileFormType)
      setFormTypesList(
        formTypesList.filter((type) => type.id !== deletedProfileFormType.id)
      );
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Form types</CardTitle>
          <CardDescription>config the form types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">Types</p>
            <Button
              onClick={() => {
                setOpenCreateFormTypeDialog(true);
              }}
            >
              Create
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mt-7">
            {formTypesList.map((type) => (
              <Card key={type.id}>
                <div className="flex items-center justify-between">
                  <CardHeader>
                    <CardTitle>{type.name}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger>
                      <Ellipsis className="text-slate-500 m-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>update</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteFormType(type.id)}
                      >
                        delete <Trash2 />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardContent>
                  <DraggableFormTypePropList type={type} />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={openCreateFormTypeDialog}
        onOpenChange={setOpenCreateFormTypeDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create new from type</DialogTitle>
            <DialogDescription>Add a new form type</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="formTypeName" className="text-right">
                Name
              </Label>
              <Input
                id="formTypeName"
                value={formTypeName} // Controlled input
                onChange={(e) => setFormTypeName(e.target.value)} // Update state on input change
                className="col-span-3"
              />
              <Label htmlFor="formTypeDescription" className="text-right">
                Description
              </Label>
              <Input
                id="formTypeDescription"
                value={formTypeDescription} // Controlled input
                onChange={(e) => setFormTypeDescription(e.target.value)} // Update state on input change
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            {formTypeName.length > 1 && formTypeDescription.length > 1 ? (
              <Button
                onClick={() => {
                  handleCreateFormType({
                    name: formTypeName,
                    description: formTypeDescription,
                    profile_id: profileId,
                  });
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
    </div>
  );
};
