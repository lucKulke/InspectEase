"use client";
import { Reorder } from "framer-motion";
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
import { Button } from "@/components/ui/button";
import {
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useState } from "react";
import { createNewMainSection } from "./actions";
import { UUID } from "crypto";
import { Ellipsis, Scale, Trash2 } from "lucide-react";

// Helper function to update order numbers

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

// -----------------------------------------

interface FormSideBarProps {
  formId: UUID;
  mainSubSections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
  setMainSubSections: React.Dispatch<
    React.SetStateAction<
      IInspectableObjectInspectionFormMainSectionWithSubSection[]
    >
  >;
}

export const FormSideBar = ({
  formId,
  mainSubSections,
  setMainSubSections,
}: FormSideBarProps) => {
  const [openCreateMainSectionDialog, setOpenCreateMainSectionDialog] =
    useState<boolean>(false);

  const [newMainSectionName, setNewMainSectionName] = useState<string>("");
  const [newMainSectionDescription, setNewMainSectionDescription] =
    useState<string>("");

  const handleCreateMainSection = async (name: string, description: string) => {
    const {
      inspectableObjectInspectionFormMainSection,
      inspectableObjectInspectionFormMainSectionError,
    } = await createNewMainSection({
      name: name,
      description: description,
      form_id: formId,
      order_number: 2,
    });
    if (inspectableObjectInspectionFormMainSection) {
      const newMainSubSection: IInspectableObjectInspectionFormMainSectionWithSubSection =
        {
          id: inspectableObjectInspectionFormMainSection.id,
          name: inspectableObjectInspectionFormMainSection.name,
          description: inspectableObjectInspectionFormMainSection.description,
          created_at: inspectableObjectInspectionFormMainSection.created_at,
          order_number: mainSubSections.length + 1,
          inspectable_object_inspection_form_sub_section: [],
          form_id: inspectableObjectInspectionFormMainSection.form_id,
        };
      inspectableObjectInspectionFormMainSection;
      setMainSubSections((prev) => [...prev, newMainSubSection]);
    }
  };

  // Main section functions

  const updateMainSectionOrderInDB = async (
    updatedItems: IInspectableObjectInspectionFormMainSectionWithSubSection[]
  ) => {
    const {
      updatedInspectableObjectProfileObjPropertys,
      updatedInspectableObjectProfileObjPropertysError,
    } = await updateMainSectionOrderInDB(updatedItems);

    if (updatedInspectableObjectProfileObjPropertysError) {
      showNotification(
        "Obj property order",
        `Error: ${updatedInspectableObjectProfileObjPropertysError.message} (${updatedInspectableObjectProfileObjPropertysError.code})`,
        "error"
      );
    }
  };

  const debouncedMainSectionUpdate = debounce(updateMainSectionOrderInDB, 500);

  const reorderItems = (
    newOrder: IInspectableObjectInspectionFormMainSectionWithSubSection[]
  ) => {
    return newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1,
    }));
  };

  const handleMainSectionReorder = (
    newOrder: IInspectableObjectInspectionFormMainSectionWithSubSection[]
  ) => {
    const updatedItems = reorderItems(newOrder);
    setMainSubSections(updatedItems);
    debouncedMainSectionUpdate(updatedItems);
  };

  function compareMainSections(
    a: IInspectableObjectInspectionFormMainSectionWithSubSection,
    b: IInspectableObjectInspectionFormMainSectionWithSubSection
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }
  // ---------------------------

  function compareSubSections(
    a: IInspectableObjectInspectionFormSubSectionResponse,
    b: IInspectableObjectInspectionFormSubSectionResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <div className="w-64 bg-gray-800 text-white p-4 overflow-y-auto">
      <Reorder.Group
        axis="y"
        values={mainSubSections}
        onReorder={handleMainSectionReorder}
        className="space-y-2 "
      >
        {mainSubSections.sort(compareMainSections).map((mainSubSection) => (
          <Reorder.Item
            key={mainSubSection.id}
            value={mainSubSection}
            className="items-center justify-between bg-white border p-4 rounded-md shadow cursor-grab "
            dragConstraints={{ top: 0, bottom: 0 }}
          >
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 font-bold w-6">
                {mainSubSection.order_number}.
              </span>
              <span>{mainSubSection.name}</span>
              <p className="text-sm text-slate-600">
                {mainSubSection.description}
              </p>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                  <Ellipsis className="text-slate-500 "></Ellipsis>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="text-red-600" onClick={() => {}}>
                    delete <Trash2></Trash2>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <Reorder.Group
                axis="y"
                values={
                  mainSubSection.inspectable_object_inspection_form_sub_section
                }
                onReorder={() => {}}
                className="space-y-2 "
              >
                {mainSubSection.inspectable_object_inspection_form_sub_section
                  .sort(compareSubSections)
                  .map((subSection) => (
                    <Reorder.Item
                      key={subSection.id}
                      value={subSection}
                      className="flex items-center justify-between bg-white border p-4 rounded-md shadow cursor-grab "
                      dragConstraints={{ top: 0, bottom: 0 }}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500 font-bold w-6">
                          {subSection.order_number}.
                        </span>
                        <span>{subSection.name}</span>
                        <p className="text-sm text-slate-600">
                          {subSection.description}
                        </p>
                      </div>

                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger>
                          <Ellipsis className="text-slate-500 "></Ellipsis>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {}}
                          >
                            delete <Trash2></Trash2>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Reorder.Item>
                  ))}
              </Reorder.Group>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <Button
        onClick={() => {
          setOpenCreateMainSectionDialog(true);
        }}
      >
        New Main-Section
      </Button>
      <Dialog
        open={openCreateMainSectionDialog}
        onOpenChange={setOpenCreateMainSectionDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create</DialogTitle>
            <DialogDescription>Create new main section</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="createMainSectionName" className="text-right">
                Name
              </Label>
              <Input
                id="createMainSectionName"
                value={newMainSectionName} // Controlled input
                onChange={(e) => setNewMainSectionName(e.target.value)} // Update state on input change
                className="col-span-3"
              />
              <Label
                htmlFor="createMainSectionDescription"
                className="text-right"
              >
                Description
              </Label>
              <Input
                id="createMainSectionDescription"
                value={newMainSectionDescription} // Controlled input
                onChange={(e) => setNewMainSectionDescription(e.target.value)} // Update state on input change
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            {newMainSectionName.length > 3 ? (
              <Button
                onClick={() => {
                  handleCreateMainSection(
                    newMainSectionName,
                    newMainSectionDescription
                  );
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
