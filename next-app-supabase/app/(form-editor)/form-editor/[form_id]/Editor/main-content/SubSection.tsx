"use client";
import {
  IFormCheckboxGroupWithCheckboxes,
  IFormCheckboxResponse,
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useEffect, useState } from "react";
import {
  ArrowBigRightDash,
  DiscAlbum,
  Divide,
  Plus,
  PlusCircle,
  Trash2,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

import { useNotification } from "@/app/context/NotificationContext";
import { Spinner } from "@/components/Spinner";

import {
  deleteAllTasks,
  deleteCheckbox,
  deleteCheckboxGroup,
  updateCheckboxesOrderNumber,
} from "./actions";
import { flushSync } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Reorder } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckboxGroupDialog, TaskDialog } from "./Dialogs";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Separator } from "@/components/ui/separator";

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

interface SubSectionProps {
  subSectionName: string;
  subSectionDescription: string;
  subSectionId: UUID;
  subSectionsData: Record<
    UUID,
    IInspectableObjectInspectionFormSubSectionWithData
  >;
  setSubSectionsData: React.Dispatch<
    React.SetStateAction<
      Record<UUID, IInspectableObjectInspectionFormSubSectionWithData>
    >
  >;

  setOpenTaskDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenCheckboxGroupDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenTextInputFieldDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCheckboxGroupId: React.Dispatch<
    React.SetStateAction<UUID | undefined>
  >;
  setSelectedSubSectionId: React.Dispatch<
    React.SetStateAction<
      `${string}-${string}-${string}-${string}-${string}` | undefined
    >
  >;
  handleDelteCheckboxGroup: (
    groupId: UUID,
    subSectionId: UUID
  ) => Promise<void>;
  handleDeleteAllTextInputFields: (subSectionId: UUID) => Promise<void>;
}

export const SubSection = ({
  subSectionName,
  subSectionDescription,
  subSectionId,
  subSectionsData,
  setOpenTaskDialog,
  setOpenCheckboxGroupDialog,
  setSelectedCheckboxGroupId,
  setSelectedSubSectionId,
  setOpenTextInputFieldDialog,
  handleDelteCheckboxGroup,
  handleDeleteAllTextInputFields,
}: SubSectionProps) => {
  const { showNotification } = useNotification();

  const [sectionData, setSectionData] =
    useState<IInspectableObjectInspectionFormSubSectionWithData>(
      subSectionsData[subSectionId]
    );

  useEffect(() => {
    if (sectionData != subSectionsData[subSectionId]) {
      setSectionData(subSectionsData[subSectionId]);
    }
  }, [subSectionsData]);

  function compareCheckboxOrderNumbers(
    a: IFormCheckboxResponse,
    b: IFormCheckboxResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  const handleDelteAllTasks = async (groupId: UUID) => {
    const { deletedFormCheckboxTasks, deletedFormCheckboxTasksError } =
      await deleteAllTasks(groupId);
    if (deletedFormCheckboxTasksError) {
      showNotification(
        "Delte all tasks",
        `Error: ${deletedFormCheckboxTasksError.message} (${deletedFormCheckboxTasksError.code})`,
        "error"
      );
    } else if (deletedFormCheckboxTasks) {
      const copy = { ...sectionData };
      copy.form_checkbox_group.filter(
        (group) => group.id === groupId
      )[0].form_checkbox_task = [];

      setSectionData(copy);
      showNotification(
        "Delte all tasks",
        `Successfully deleted all tasks for checkbox group '${groupId}'`,
        "info"
      );
    }
  };

  return (
    <div className="border-2 hover:border-black rounded-xl p-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <p>{subSectionName}</p>
          </TooltipTrigger>
          <TooltipContent>
            <p>{subSectionDescription}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {sectionData.form_checkbox_group.map((group) => {
        return (
          <div className="flex space-x-5 p-5 " key={group.id}>
            <div
              className={` w-2/3 ${
                group.form_checkbox_task.length === 0 && "rounded-xl border-2"
              }`}
            >
              {group.form_checkbox_task.length > 0 ? (
                <ContextMenu modal={false}>
                  <ContextMenuTrigger>
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Tasks</CardTitle>
                        <CardDescription>
                          Tasks that need to be fullfilled
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <ul className="pl-4">
                          {group.form_checkbox_task.map((task) => (
                            <li key={task.id}>- {task.description}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => {
                        setSelectedCheckboxGroupId(group.id);
                        setSelectedSubSectionId(subSectionId);
                        setOpenTaskDialog(true);
                      }}
                    >
                      update
                    </ContextMenuItem>
                    <ContextMenuItem
                      className="text-red-500 flex justify-between"
                      onClick={() => {
                        handleDelteAllTasks(group.id);
                      }}
                    >
                      delete <Trash2></Trash2>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <button
                    onClick={() => {
                      console.log("group", group);
                      setSelectedCheckboxGroupId(group.id);
                      setSelectedSubSectionId(subSectionId);
                      setOpenTaskDialog(true);
                    }}
                  >
                    <PlusCircle
                      size={32}
                      className="text-gray-400 hover:text-black"
                    />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <ArrowBigRightDash
                className={`${
                  group.form_checkbox_task.length > 0
                    ? "text-black"
                    : "text-gray-400"
                } `}
                size={32}
              />
            </div>
            <ContextMenu modal={false}>
              <ContextMenuTrigger className="w-1/3">
                <Card className="w-full h-full" key={group.id}>
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>
                      {group.form_checkbox.length} checkbox
                      {group.form_checkbox.length !== 1 ? "es" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {group.form_checkbox.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No checkboxes in this group.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {group.form_checkbox
                          .sort(compareCheckboxOrderNumbers)
                          .map((checkbox) => (
                            <li
                              key={checkbox.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                checked={true}
                                id={`preview-${group.id}-${checkbox.id}`}
                              />
                              <Label
                                htmlFor={`preview-${group.id}-${checkbox.id}`}
                              >
                                {checkbox.label}
                              </Label>
                            </li>
                          ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={() => {
                    setSelectedCheckboxGroupId(group.id);
                    setSelectedSubSectionId(subSectionId);
                    setOpenCheckboxGroupDialog(true);
                  }}
                >
                  update
                </ContextMenuItem>
                <ContextMenuItem
                  className="text-red-500 flex justify-between"
                  onClick={() =>
                    handleDelteCheckboxGroup(group.id, subSectionId)
                  }
                >
                  delete <Trash2></Trash2>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        );
      })}
      {sectionData.form_text_input_field.length > 0 && (
        <>
          <Separator />{" "}
          <ContextMenu modal={false}>
            <ContextMenuTrigger>
              <Card className="m-4">
                <CardHeader>
                  <CardTitle>Text Input Fields</CardTitle>
                  <CardDescription>
                    text input fields that can be filled with text
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="p-4 space-y-2">
                    {sectionData.form_text_input_field.map((field) => {
                      return (
                        <div
                          key={field.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center w-3/4 space-x-2">
                            <Input
                              className="w-1/3"
                              disabled={true}
                              id={field.id + "input"}
                              placeholder={field.placeholder_text}
                            ></Input>
                            <Label
                              className="truncate w-2/3"
                              htmlFor={field.id + "input"}
                            >
                              {field.label}
                            </Label>
                          </div>
                        </div>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => {
                  setSelectedSubSectionId(subSectionId);
                  setOpenTextInputFieldDialog(true);
                }}
              >
                update
              </ContextMenuItem>
              <ContextMenuItem
                className="text-red-500 flex justify-between"
                onClick={() => handleDeleteAllTextInputFields(subSectionId)}
              >
                delete <Trash2></Trash2>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </>
      )}
    </div>
  );
};
