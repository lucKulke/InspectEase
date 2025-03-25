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

import { updateCheckboxesOrderNumber } from "./actions";
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
}

interface GroupState {
  multi: boolean;
  single: boolean;
  text: boolean;
}

export const SubSection = ({
  subSectionName,
  subSectionDescription,
  subSectionId,
  subSectionsData,
  setSubSectionsData,
}: SubSectionProps) => {
  const { showNotification } = useNotification();

  const [sectionData, setSectionData] =
    useState<IInspectableObjectInspectionFormSubSectionWithData>(
      subSectionsData[subSectionId]
    );
  const [openTaskDialog, setOpenTaskDialog] = useState<boolean>(false);
  const [openCheckboxGroupDialog, setOpenCheckboxGroupDialog] =
    useState<boolean>(false);

  useEffect(() => {
    if (sectionData != subSectionsData[subSectionId]) {
      setSectionData(subSectionsData[subSectionId]);
    }
  }, [subSectionsData]);

  const [currentCheckboxGroupId, setCurrentCheckboxGroupId] =
    useState<UUID | null>(null);

  function compareCheckboxOrderNumbers(
    a: IFormCheckboxResponse,
    b: IFormCheckboxResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }
  return (
    <div className="border-2  rounded-xl p-2">
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
                        setCurrentCheckboxGroupId(group.id);
                        setOpenTaskDialog(true);
                      }}
                    >
                      update
                    </ContextMenuItem>
                    <ContextMenuItem className="text-red-500 flex justify-between">
                      delete <Trash2></Trash2>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <button
                    onClick={() => {
                      console.log("group", group);
                      setCurrentCheckboxGroupId(group.id);
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
                    setCurrentCheckboxGroupId(group.id);
                    setOpenCheckboxGroupDialog(true);
                  }}
                >
                  update
                </ContextMenuItem>
                <ContextMenuItem className="text-red-500 flex justify-between">
                  delete <Trash2></Trash2>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        );
      })}
      {currentCheckboxGroupId && (
        <>
          <TaskDialog
            open={openTaskDialog}
            setOpen={setOpenTaskDialog}
            currentCheckboxGroupId={currentCheckboxGroupId}
            sectionData={sectionData}
            setSectionData={setSectionData}
          />
          <CheckboxGroupDialog
            open={openCheckboxGroupDialog}
            setOpen={setOpenCheckboxGroupDialog}
            currentCheckboxGroupId={currentCheckboxGroupId}
            sectionData={sectionData}
            setSectionData={setSectionData}
          />
        </>
      )}
    </div>
  );
};
