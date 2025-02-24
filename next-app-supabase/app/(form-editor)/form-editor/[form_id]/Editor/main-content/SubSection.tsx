"use client";
import {
  IInspectableObjectInspectionFormMultipleChoiceFieldInsert,
  IInspectableObjectInspectionFormMultipleChoiceGroupResponse,
  IInspectableObjectInspectionFormMultipleChoiceGroupWithFields,
  IInspectableObjectInspectionFormSingleChoiceGroupResponse,
  IInspectableObjectInspectionFormSingleChoiceGroupWithFields,
  IInspectableObjectInspectionFormSubSectionResponse,
  IInspectableObjectInspectionFormTextInputGroupResponse,
  IInspectableObjectInspectionFormTextInputGroupWithFields,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UUID } from "crypto";
import {
  fetchMultipleChoiceGroupWithFields,
  fetchSingleChoiceGroupWithFields,
  fetchTextInputGroupWithFields,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { Spinner } from "@/components/Spinner";

interface SubSectionProps {
  subSection: IInspectableObjectInspectionFormSubSectionResponse;
}

export const SubSection = ({ subSection }: SubSectionProps) => {
  const { showNotification } = useNotification();
  const [open, setOpen] = useState<boolean>(false);
  const [test, setTest] = useState<string>("");

  const [multipleChoiceGroup, setMultipleChoiceGroup] =
    useState<IInspectableObjectInspectionFormMultipleChoiceGroupWithFields>();
  const [singleChoiceGroup, setSingleChoiceGroup] =
    useState<IInspectableObjectInspectionFormSingleChoiceGroupWithFields>();
  const [textInputGroup, setTextInputGroup] =
    useState<IInspectableObjectInspectionFormTextInputGroupWithFields>();

  const [noMulitpleChoiceGroupFound, setNoMulitpleChoiceGroupFound] =
    useState<boolean>(false);
  const [noSingleChoiceGroupFound, setNoSingleChoiceGroupFound] =
    useState<boolean>(false);
  const [noTextInputGroupFound, setNoTextInputGroupFound] =
    useState<boolean>(false);

  const getMultipleChoiceGroupWithFields = async (subSectionId: UUID) => {
    const {
      inspectableObjectInspectionFormMultipleChoiceGroupWithFields,
      inspectableObjectInspectionFormMultipleChoiceGroupWithFieldsError,
    } = await fetchMultipleChoiceGroupWithFields(subSectionId);

    if (inspectableObjectInspectionFormMultipleChoiceGroupWithFieldsError) {
      showNotification(
        "Fetch multiple choice group with fields",
        `Error: ${inspectableObjectInspectionFormMultipleChoiceGroupWithFieldsError.message} (${inspectableObjectInspectionFormMultipleChoiceGroupWithFieldsError.code})`,
        "error"
      );
    } else if (inspectableObjectInspectionFormMultipleChoiceGroupWithFields) {
      setMultipleChoiceGroup(
        inspectableObjectInspectionFormMultipleChoiceGroupWithFields
      );
      return;
    }
    setNoMulitpleChoiceGroupFound(true);
  };

  const getSingleChoiceGroupWithFields = async (subSectionId: UUID) => {
    const {
      inspectableObjectInspectionFormSingleChoiceGroupWithFields,
      inspectableObjectInspectionFormSingleChoiceGroupWithFieldsError,
    } = await fetchSingleChoiceGroupWithFields(subSectionId);

    if (inspectableObjectInspectionFormSingleChoiceGroupWithFieldsError) {
      showNotification(
        "Fetch single choice group with fields",
        `Error: ${inspectableObjectInspectionFormSingleChoiceGroupWithFieldsError.message} (${inspectableObjectInspectionFormSingleChoiceGroupWithFieldsError.code})`,
        "error"
      );
    } else if (inspectableObjectInspectionFormSingleChoiceGroupWithFields) {
      setSingleChoiceGroup(
        inspectableObjectInspectionFormSingleChoiceGroupWithFields
      );
      return;
    }
    setNoSingleChoiceGroupFound(true);
  };
  const getTextInputGroupWithFields = async (subSectionId: UUID) => {
    const {
      inspectableObjectInspectionFormTextInputGroupWithFields,
      inspectableObjectInspectionFormTextInputGroupWithFieldsError,
    } = await fetchTextInputGroupWithFields(subSectionId);

    if (inspectableObjectInspectionFormTextInputGroupWithFieldsError) {
      showNotification(
        "Fetch text input group with fields",
        `Error: ${inspectableObjectInspectionFormTextInputGroupWithFieldsError.message} (${inspectableObjectInspectionFormTextInputGroupWithFieldsError.code})`,
        "error"
      );
    } else if (inspectableObjectInspectionFormTextInputGroupWithFields) {
      setTextInputGroup(
        inspectableObjectInspectionFormTextInputGroupWithFields
      );
      return;
    }
    setNoTextInputGroupFound(true);
  };

  useEffect(() => {
    getMultipleChoiceGroupWithFields(subSection.id);
    getSingleChoiceGroupWithFields(subSection.id);
    getTextInputGroupWithFields(subSection.id);
  }, []);

  return (
    <div className="m-2">
      <p className="">{subSection.name}</p>

      <div className="border-2 rounded-xl p-2 hover:shadow-lg space-y-3">
        <div className="border-2 min-h-24 p-2 rounded-xl hover:shadow-lg">
          <p>Multiple choice group</p>
          {multipleChoiceGroup ? (
            multipleChoiceGroup.id
          ) : noMulitpleChoiceGroupFound ? (
            ""
          ) : (
            <div className="flex justify-center">
              <Spinner></Spinner>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <div className="border-2 flex-1 min-h-24 rounded-xl p-2 hover:shadow-lg">
            <p>Single choice group</p>
            {singleChoiceGroup ? (
              singleChoiceGroup.id
            ) : noSingleChoiceGroupFound ? (
              ""
            ) : (
              <div className="flex justify-center">
                <Spinner />
              </div>
            )}
          </div>
          <div className="border-2 flex-1 min-h-24 rounded-xl p-2 hover:shadow-lg">
            <p>Text input group</p>
            {textInputGroup ? (
              textInputGroup.id
            ) : noTextInputGroupFound ? (
              ""
            ) : (
              <div className="flex justify-center">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select</DialogTitle>
            <DialogDescription>Select field groups section</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor={subSection.id + "createFieldGroupDialog"}
                className="text-right"
              >
                Name
              </Label>
              <input
                id={subSection.id + "createFieldGroupDialog"}
                type="checkbox"
                value={test} // Controlled input
                onChange={(e) => setTest(e.target.value)} // Update state on input change
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            {test.length > 3 ? (
              <Button onClick={() => {}}>Save changes</Button>
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
