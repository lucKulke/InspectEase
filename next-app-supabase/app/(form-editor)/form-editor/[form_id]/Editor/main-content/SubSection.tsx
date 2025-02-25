"use client";
import {
  IInspectableObjectInspectionFormSubSectionResponse,
  IInspectableObjectInspectionFormTextInputGroupResponse,
  IMultipleChoiceGroupResponse,
  ISingleChoiceGroupResponse,
  ITextInputGroupResponse,
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

import { useNotification } from "@/app/context/NotificationContext";
import { Spinner } from "@/components/Spinner";
import { MultipleChoiceGroup } from "./field-groups/MutlipleChoiceGroup";
import { SingleChoiceGroup } from "./field-groups/SingleChoiceGroup";
import { TextInputGroup } from "./field-groups/TextInputGroup";
import {
  createMultipleChoiceGroup,
  createSingleChoiceGroup,
  createTextInputGroup,
  deleteMultipleChoiceGroup,
  deleteSingleChoiceGroup,
  deleteTextInputGroup,
} from "./actions";

interface SubSectionProps {
  subSection: IInspectableObjectInspectionFormSubSectionResponse;
}

interface GroupState {
  multi: boolean;
  single: boolean;
  text: boolean;
}

export const SubSection = ({ subSection }: SubSectionProps) => {
  const { showNotification } = useNotification();
  const [openGroupSelectDialog, setOpenGroupSelectDialog] =
    useState<boolean>(false);

  const [multipleChoiceGroupExists, setMultipleChoiceGroupExists] =
    useState<boolean>(
      subSection.multiple_choice_group.length > 0 ? true : false
    );

  const [singleChoiceGroupExists, setSingleChoiceGroupExists] =
    useState<boolean>(subSection.single_choice_group.length > 0 ? true : false);

  const [textInputGroupExists, setTextInputGroupExists] = useState<boolean>(
    subSection.text_input_group.length > 0 ? true : false
  );

  const [currentGroupState, setCurrentGroupState] = useState<GroupState>({
    multi: subSection.multiple_choice_group.length > 0 ? true : false,
    single: subSection.single_choice_group.length > 0 ? true : false,
    text: subSection.text_input_group.length > 0 ? true : false,
  });

  const [somethingChanged, setSomethingChanged] = useState<
    boolean | GroupState
  >(false);

  const checkIfSomethingChanged = (): boolean | GroupState => {
    const changedGroups: GroupState = {
      multi: false,
      single: false,
      text: false,
    };
    if (currentGroupState.multi !== multipleChoiceGroupExists)
      changedGroups.multi = true;

    if (currentGroupState.single !== singleChoiceGroupExists)
      changedGroups.single = true;

    if (currentGroupState.text !== textInputGroupExists)
      changedGroups.text = true;

    const isAnyTrue = Object.values(changedGroups).some(
      (value) => value === true
    );
    if (isAnyTrue) return changedGroups;
    return false;
  };

  useEffect(() => {
    setSomethingChanged(checkIfSomethingChanged());
  }, [
    multipleChoiceGroupExists,
    singleChoiceGroupExists,
    textInputGroupExists,
  ]);

  const [multipleChoiceGroup, setMultipleChoiceGroup] = useState<
    IMultipleChoiceGroupResponse | undefined
  >(
    subSection.multiple_choice_group
      ? subSection.multiple_choice_group[0]
      : undefined
  );
  const [singleChoiceGroup, setSingleChoiceGroup] = useState<
    ISingleChoiceGroupResponse | undefined
  >(
    subSection.single_choice_group
      ? subSection.single_choice_group[0]
      : undefined
  );
  const [textInputGroup, setTextInputGroup] = useState<
    ITextInputGroupResponse | undefined
  >(subSection.text_input_group ? subSection.text_input_group[0] : undefined);

  const createMulti = async () => {
    console.log("create multiple choice group");
    const { multipleChoiceGroupResponse, multipleChoiceGroupResponseError } =
      await createMultipleChoiceGroup(subSection.id);
    if (multipleChoiceGroupResponseError) {
      showNotification(
        "Add multiple choice group",
        `Error: ${multipleChoiceGroupResponseError.message} (${multipleChoiceGroupResponseError.code})`,
        "error"
      );
    } else if (multipleChoiceGroupResponse) {
      setMultipleChoiceGroup(multipleChoiceGroupResponse);
      showNotification(
        "Add multiple choice group",
        `Successfully added multiple choice group with id '${multipleChoiceGroupResponse.id}'`,
        "info"
      );
    }
  };

  const deleteMulti = async () => {
    console.log(
      `delete multiple choice group with id '${multipleChoiceGroup?.id}'`
    );
    if (!multipleChoiceGroup) return;
    const { multipleChoiceGroupResponse, multipleChoiceGroupResponseError } =
      await deleteMultipleChoiceGroup(multipleChoiceGroup.id);
    if (multipleChoiceGroupResponseError) {
      showNotification(
        "Delete multiple choice group",
        `Error: ${multipleChoiceGroupResponseError.message} (${multipleChoiceGroupResponseError.code})`,
        "error"
      );
    } else if (multipleChoiceGroupResponse) {
      setMultipleChoiceGroup(undefined);
      showNotification(
        "Delete multiple choice group",
        `Successfully deleted multiple choice group with id '${multipleChoiceGroupResponse.id}'`,
        "info"
      );
    }
  };

  const createSingle = async () => {
    console.log("create single choice group");
    const { singleChoiceGroupResponse, singleChoiceGroupResponseError } =
      await createSingleChoiceGroup(subSection.id);
    if (singleChoiceGroupResponseError) {
      showNotification(
        "Add single choice group",
        `Error: ${singleChoiceGroupResponseError.message} (${singleChoiceGroupResponseError.code})`,
        "error"
      );
    } else if (singleChoiceGroupResponse) {
      setSingleChoiceGroup(singleChoiceGroupResponse);
      showNotification(
        "Add single choice group",
        `Successfully added multiple choice group with id '${singleChoiceGroupResponse.id}'`,
        "info"
      );
    }
  };

  const deleteSingle = async () => {
    console.log(
      `delete single choice group with id '${singleChoiceGroup?.id}'`
    );
    if (!singleChoiceGroup) return;
    const { singleChoiceGroupResponse, singleChoiceGroupResponseError } =
      await deleteSingleChoiceGroup(singleChoiceGroup.id);
    if (singleChoiceGroupResponseError) {
      showNotification(
        "Delete single choice group",
        `Error: ${singleChoiceGroupResponseError.message} (${singleChoiceGroupResponseError.code})`,
        "error"
      );
    } else if (singleChoiceGroupResponse) {
      setSingleChoiceGroup(undefined);
      showNotification(
        "Delete single choice group",
        `Successfully deleted single choice group with id '${singleChoiceGroupResponse.id}'`,
        "info"
      );
    }
  };

  const createTextGr = async () => {
    console.log("create text input group");
    const { textInputGroupResponse, textInputGroupResponseError } =
      await createTextInputGroup(subSection.id);
    if (textInputGroupResponseError) {
      showNotification(
        "Add text input group",
        `Error: ${textInputGroupResponseError.message} (${textInputGroupResponseError.code})`,
        "error"
      );
    } else if (textInputGroupResponse) {
      setTextInputGroup(textInputGroupResponse);
      showNotification(
        "Add text input group",
        `Successfully added text input group with id '${textInputGroupResponse.id}'`,
        "info"
      );
    }
  };

  const deleteTextGr = async () => {
    console.log(`delete text input group with id '${textInputGroup?.id}'`);
    if (!textInputGroup) return;
    const { textInputGroupResponse, textInputGroupResponseError } =
      await deleteTextInputGroup(textInputGroup.id);
    if (textInputGroupResponseError) {
      showNotification(
        "Delete text input group",
        `Error: ${textInputGroupResponseError.message} (${textInputGroupResponseError.code})`,
        "error"
      );
    } else if (textInputGroupResponse) {
      setSingleChoiceGroup(undefined);
      showNotification(
        "Delete text input group",
        `Successfully deleted text input group with id '${textInputGroupResponse.id}'`,
        "info"
      );
    }
  };

  const handleChangeGroupState = async () => {
    setOpenGroupSelectDialog(false);
    console.log(somethingChanged);

    const changedGroupState = somethingChanged as GroupState;
    if (changedGroupState.multi) {
      if (multipleChoiceGroupExists) {
        createMulti();
      } else {
        deleteMulti();
      }
    }
    if (changedGroupState.single) {
      if (singleChoiceGroupExists) {
        createSingle();
      } else {
        deleteSingle();
      }
    }

    if (changedGroupState.text) {
      if (textInputGroupExists) {
        createTextGr();
      } else {
        deleteTextGr();
      }
    }
  };

  return (
    <div className="m-2">
      <div className="flex">
        <p>{subSection.name}</p>
        <button
          onClick={() => {
            setMultipleChoiceGroupExists(
              subSection.multiple_choice_group.length > 0 ? true : false
            );
            setSingleChoiceGroupExists(
              subSection.single_choice_group.length > 0 ? true : false
            );
            setTextInputGroupExists(
              subSection.text_input_group.length > 0 ? true : false
            );
            setOpenGroupSelectDialog(true);
          }}
        >
          <Plus></Plus>
        </button>
      </div>

      <div className="border-2 rounded-xl p-2 space-y-3">
        {multipleChoiceGroup ? (
          <MultipleChoiceGroup groupData={multipleChoiceGroup} />
        ) : (
          <div className="border-2 min-h-24 p-2 rounded-xl">
            <p className="text-gray-300">Multiple choice group</p>
          </div>
        )}

        <div className="flex space-x-2">
          {singleChoiceGroup ? (
            <SingleChoiceGroup groupData={singleChoiceGroup} />
          ) : (
            <div className="border-2 flex-1 min-h-24 rounded-xl p-2">
              <p className="text-gray-300">Single choice group</p>
            </div>
          )}

          {textInputGroup ? (
            <TextInputGroup groupData={textInputGroup} />
          ) : (
            <div className="border-2 flex-1 min-h-24 rounded-xl p-2">
              <p className="text-gray-300">Text input group</p>
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={openGroupSelectDialog}
        onOpenChange={setOpenGroupSelectDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select</DialogTitle>
            <DialogDescription>Select field groups section</DialogDescription>
          </DialogHeader>
          <ul className="space-y-4">
            <li className=" flex items-center space-x-2">
              <Label htmlFor={subSection.id + "multipleChoiceGroup"}>
                Multiple choice group
              </Label>
              <input
                id={subSection.id + "multipleChoiceGroup"}
                type="checkbox"
                checked={multipleChoiceGroupExists}
                onChange={() =>
                  setMultipleChoiceGroupExists(!multipleChoiceGroupExists)
                } // Update state on input change
              />
            </li>
            <li className=" flex items-center space-x-2">
              <Label htmlFor={subSection.id + "singleChoiceGroup"}>
                Single choice group
              </Label>
              <input
                id={subSection.id + "singleChoiceGroup"}
                type="checkbox"
                checked={singleChoiceGroupExists}
                onChange={() =>
                  setSingleChoiceGroupExists(!singleChoiceGroupExists)
                } // Update state on input change
              />
            </li>
            <li className=" flex items-center space-x-2">
              <Label htmlFor={subSection.id + "textInputGroup"}>
                Text input group
              </Label>
              <input
                id={subSection.id + "textInputGroup"}
                type="checkbox"
                checked={textInputGroupExists}
                onChange={() => setTextInputGroupExists(!textInputGroupExists)} // Update state on input change
              />
            </li>
          </ul>
          <DialogFooter>
            {somethingChanged ? (
              <Button onClick={() => handleChangeGroupState()}>
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
