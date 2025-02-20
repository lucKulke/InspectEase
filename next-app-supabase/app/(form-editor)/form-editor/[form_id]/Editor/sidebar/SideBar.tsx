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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IInspectableObjectInspectionFormMainSectionResponse,
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionInsert,
  IInspectableObjectInspectionFormSubSectionResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useState } from "react";
import {
  createNewMainSection,
  createNewSubSection,
  updateMainSectionOrder,
} from "../actions";
import { UUID } from "crypto";
import { Ellipsis, Scale, Trash2 } from "lucide-react";
import { useNotification } from "@/app/context/NotificationContext";
import { SubSections } from "./SubSections";

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
  const { showNotification } = useNotification();

  const [openCreateMainSectionDialog, setOpenCreateMainSectionDialog] =
    useState<boolean>(false);
  const [newMainSectionName, setNewMainSectionName] = useState<string>("");
  const [newMainSectionDescription, setNewMainSectionDescription] =
    useState<string>("");

  const [openCreateSubDialog, setOpenCreateSubSectionDialog] =
    useState<boolean>(false);
  const [newSubSectionName, setNewSubSectionName] = useState<string>("");
  const [newSubSectionDescription, setNewSubSectionDescription] =
    useState<string>("");
  const [newSubSectionOrderNumber, setNewSubSectionOrderNumber] =
    useState<number>(0);

  const [selectedMainSection, setSelectedMainSection] = useState<string>("");

  const handleCreateMainSection = async (name: string, description: string) => {
    const {
      inspectableObjectInspectionFormMainSection,
      inspectableObjectInspectionFormMainSectionError,
    } = await createNewMainSection({
      name: name,
      description: description,
      form_id: formId,
      order_number: mainSubSections.length + 1,
    });

    if (inspectableObjectInspectionFormMainSectionError) {
      showNotification(
        "Create main section",
        `Error: ${inspectableObjectInspectionFormMainSectionError.message} (${inspectableObjectInspectionFormMainSectionError.code})`,
        "error"
      );
    } else if (inspectableObjectInspectionFormMainSection) {
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
      showNotification(
        "Create main section",
        `Successfully created new main section with id '${inspectableObjectInspectionFormMainSection.id}'`,
        "info"
      );
    }
  };

  const updateMainSectionOrderInDB = async (
    updatedItems: IInspectableObjectInspectionFormMainSectionWithSubSection[]
  ) => {
    const updatedMainSections: IInspectableObjectInspectionFormMainSectionResponse[] =
      [];
    for (let i = 0; i < updatedItems.length; i++) {
      updatedMainSections.push({
        id: updatedItems[i].id,
        name: updatedItems[i].name,
        description: updatedItems[i].description,
        created_at: updatedItems[i].created_at,
        form_id: updatedItems[i].form_id,
        order_number: updatedItems[i].order_number,
      });
    }
    const {
      updatedInspectableObjectInspectionFormMainSections,
      updatedInspectableObjectInspectionFormMainSectionsError,
    } = await updateMainSectionOrder(updatedMainSections);

    if (updatedInspectableObjectInspectionFormMainSectionsError) {
      showNotification(
        "Main section order",
        `Error: ${updatedInspectableObjectInspectionFormMainSectionsError.message} (${updatedInspectableObjectInspectionFormMainSectionsError.code})`,
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

  const handleCreateSubSection = async (
    newSubSection: IInspectableObjectInspectionFormSubSectionInsert
  ) => {
    const {
      inspectableObjectInspectionFormSubSection,
      inspectableObjectInspectionFormSubSectionError,
    } = await createNewSubSection(newSubSection);

    if (inspectableObjectInspectionFormSubSectionError) {
      showNotification(
        "Create sub section",
        `Error: ${inspectableObjectInspectionFormSubSectionError.message} (${inspectableObjectInspectionFormSubSectionError.code})`,
        "error"
      );
    } else if (inspectableObjectInspectionFormSubSection) {
      const copyOfMainSubSections: IInspectableObjectInspectionFormMainSectionWithSubSection[] =
        [...mainSubSections];

      for (let i = 0; i < copyOfMainSubSections.length; i++) {
        const mainWithSubSections = copyOfMainSubSections[i];
        if (
          mainWithSubSections.id ===
          inspectableObjectInspectionFormSubSection.main_section_id
        ) {
          mainWithSubSections.inspectable_object_inspection_form_sub_section.push(
            inspectableObjectInspectionFormSubSection
          );
          break;
        }
      }
      setMainSubSections(copyOfMainSubSections);
      showNotification(
        "Create sub section",
        `Successfully created new sub section with id'${inspectableObjectInspectionFormSubSection.id}'`,
        "info"
      );
    }
  };

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
            className=" bg-white border p-4 rounded-md shadow cursor-grab "
            dragConstraints={{ top: 0, bottom: 0 }}
          >
            <div className="flex justify-between">
              <span className="text-gray-500 font-bold w-6">
                {mainSubSection.order_number}.
              </span>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-slate-600 font-bold">
                      {mainSubSection.name}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{mainSubSection.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                  <Ellipsis className="text-slate-500 "></Ellipsis>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedMainSection(mainSubSection.id);
                      setNewSubSectionOrderNumber(
                        mainSubSection
                          .inspectable_object_inspection_form_sub_section
                          .length + 1
                      );
                      setOpenCreateSubSectionDialog(true);
                    }}
                  >
                    create sub section
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => {}}>
                    delete <Trash2></Trash2>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <SubSections
                mainSectionWithSubsections={mainSubSection}
              ></SubSections>
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

      <Dialog
        open={openCreateSubDialog}
        onOpenChange={setOpenCreateSubSectionDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create</DialogTitle>
            <DialogDescription>Create new sub section</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="createSubSectionName" className="text-right">
                Name
              </Label>
              <Input
                id="createSubSectionName"
                value={newSubSectionName} // Controlled input
                onChange={(e) => setNewSubSectionName(e.target.value)} // Update state on input change
                className="col-span-3"
              />
              <Label
                htmlFor="createSubSectionDescription"
                className="text-right"
              >
                Description
              </Label>
              <Input
                id="createSubSectionDescription"
                value={newSubSectionDescription} // Controlled input
                onChange={(e) => setNewSubSectionDescription(e.target.value)} // Update state on input change
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            {newSubSectionName.length > 3 ? (
              <Button
                onClick={() => {
                  handleCreateSubSection({
                    name: newSubSectionName,
                    description: newSubSectionDescription,
                    main_section_id: selectedMainSection as UUID,
                    order_number: newSubSectionOrderNumber,
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
