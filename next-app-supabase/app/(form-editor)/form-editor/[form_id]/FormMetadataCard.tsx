"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DialogFooter,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IInspectableObjectInspectionFormPropertyInsert,
  IInspectableObjectInspectionFormPropertyResponse,
  IInspectableObjectInspectionFormWithProps,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeWithProps,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { Label } from "@radix-ui/react-dropdown-menu";
import { UUID } from "crypto";
import { ArrowBigLeft, PenLine, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/app/context/NotificationContext";
import {
  assignFirstValueToFormProperty,
  deleteEntireForm,
  updateFormProperty,
} from "./actions";
import { useRouter } from "next/navigation";
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
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";

interface FormMetadataCardProps {
  formId: UUID;
  formMetadata: Record<UUID, IInspectableObjectInspectionFormPropertyResponse>;
  profileFormTypeWithProps: IInspectableObjectProfileFormTypeWithProps;
  objId: UUID;
}
export const FormMetadataCard = ({
  formId,
  formMetadata,
  profileFormTypeWithProps,
  objId,
}: FormMetadataCardProps) => {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [oldFormPropValue, setOldFormPropValue] = useState<string>("");
  const [currentFormPropValue, setCurrentFormPropValue] = useState<string>("");
  const [selectedFormPropId, setSelectedFormPropId] = useState<UUID>();
  const [selectedFormProfileId, setSelectedFormTypePropId] = useState<UUID>();

  function compareProfileFormTypeProps(
    a: IInspectableObjectProfileFormTypePropertyResponse,
    b: IInspectableObjectProfileFormTypePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  const handleUpdateProp = async () => {
    setOpenUpdateDialog(false);
    if (!selectedFormPropId) return;

    const {
      updatedInspectableObjectFormProperty,
      updatedInspectableObjectFormPropertyError,
    } = await updateFormProperty(selectedFormPropId, {
      value: currentFormPropValue,
    });

    if (updatedInspectableObjectFormPropertyError) {
      showNotification(
        "Update object prop",
        `Error: ${updatedInspectableObjectFormPropertyError.message} (${updatedInspectableObjectFormPropertyError.code})`,
        "error"
      );
    } else if (updatedInspectableObjectFormProperty) {
      showNotification(
        "Update object prop",
        `Successfully updated '${updatedInspectableObjectFormProperty.value}' to '${updatedInspectableObjectFormProperty.value}'`,
        "info"
      );

      router.refresh();
    }
  };

  const handleNewValueFormProp = async (
    formTypePropId: UUID,
    value: string
  ) => {
    setOpenUpdateDialog(false);
    const prop: IInspectableObjectInspectionFormPropertyInsert = {
      form_type_prop_id: formTypePropId,
      inspection_form_id: formId,
      value: value,
    };

    const {
      inspectableObjectInspectionFormProperty,
      inspectableObjectInspectionFormPropertyError,
    } = await assignFirstValueToFormProperty(prop);

    if (inspectableObjectInspectionFormPropertyError) {
      showNotification(
        "Update object prop",
        `Error: ${inspectableObjectInspectionFormPropertyError.message} (${inspectableObjectInspectionFormPropertyError.code})`,
        "error"
      );
    } else if (inspectableObjectInspectionFormProperty) {
      showNotification(
        "Update object prop",
        `Successfully updated '${oldFormPropValue}' to '${inspectableObjectInspectionFormProperty.value}'`,
        "info"
      );
      setSelectedFormPropId(undefined);
      router.refresh();
    }
  };

  const handleDeleteEntireForm = async () => {
    const { deletedForms, deletedFormsError } = await deleteEntireForm([
      formId,
    ]);
    if (deletedFormsError) {
      showNotification(
        "Delete form",
        `Error: ${deletedFormsError.message} (${deletedFormsError.code})`,
        "error"
      );
    } else if (deletedForms) {
      showNotification(
        "Delete form",
        `Successfully deleted form with id '${deletedForms[0].id}'`,
        "info"
      );

      router.push(formBuilderLinks["inspectableObjects"].href + "/" + objId);
    }
  };
  return (
    <>
      <button
        className="flex items-center"
        onClick={() =>
          router.push(
            formBuilderLinks["inspectableObjects"].href +
              "/" +
              objId +
              "?tab=" +
              profileFormTypeWithProps.id
          )
        }
      >
        <ArrowBigLeft /> Back
      </button>
      <Card>
        <div className="flex justify-between items-center">
          <CardHeader>
            <CardTitle>{profileFormTypeWithProps?.name}</CardTitle>
            <CardDescription>{formId}</CardDescription>
          </CardHeader>

          <AlertDialog>
            <AlertDialogTrigger>
              <Trash2 className="text-red-500 mr-4 hover:text-red-700"></Trash2>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  form and all its data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEntireForm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <CardContent>
          <ul>
            {profileFormTypeWithProps?.inspectable_object_profile_form_type_property
              ?.sort(compareProfileFormTypeProps)
              .map((profileFormTypeProp) => (
                <li
                  key={profileFormTypeProp.id}
                  className="flex items-center mb-2 group"
                >
                  <h2 className="text-slate-600 mr-2">
                    {profileFormTypeProp.name}:
                  </h2>
                  <p>{formMetadata[profileFormTypeProp.id]?.value}</p>
                  <button
                    onClick={() => {
                      if (formMetadata[profileFormTypeProp.id]) {
                        setOpenUpdateDialog(true);
                        setSelectedFormPropId(
                          formMetadata[profileFormTypeProp.id].id
                        );
                        setOldFormPropValue(
                          formMetadata[profileFormTypeProp.id].value
                        );
                        setCurrentFormPropValue(
                          formMetadata[profileFormTypeProp.id].value
                        );
                      } else {
                        setSelectedFormPropId(undefined);
                        setOpenUpdateDialog(true);

                        setSelectedFormTypePropId(profileFormTypeProp.id);
                        setOldFormPropValue("");
                        setCurrentFormPropValue("");
                      }
                    }}
                  >
                    <PenLine
                      className="opacity-0 group-hover:opacity-100"
                      size={20}
                    ></PenLine>
                  </button>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
      <Dialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update</DialogTitle>
            <DialogDescription>Update the current value</DialogDescription>
          </DialogHeader>
          <Label>
            Value
            <Input
              value={currentFormPropValue}
              onChange={(e) => setCurrentFormPropValue(e.target.value)}
            ></Input>
          </Label>
          <DialogFooter>
            {oldFormPropValue !== currentFormPropValue ? (
              <Button
                onClick={() => {
                  if (selectedFormPropId) {
                    handleUpdateProp();
                  } else {
                    if (selectedFormProfileId) {
                      handleNewValueFormProp(
                        selectedFormProfileId,
                        currentFormPropValue
                      );
                    }
                  }
                  // else {
                  //   if (selectedProfileId)
                  //     handleNewValueProp(
                  //       objectInfo[0].id,
                  //       selectedProfileId,
                  //       currentObjectPropValue
                  //     );
                  // }
                }}
              >
                Save changes
              </Button>
            ) : (
              <Button variant="outline">Save changes</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
