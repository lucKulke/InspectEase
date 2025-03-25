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
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useState } from "react";
import {
  createNewMainSection,
  createNewSubSection,
  deleteMainSection,
  deleteSubSection,
  updateMainSection,
  updateMainSectionOrder,
  updateSubSection,
  updateSubSectionOrder,
} from "../actions";
import { UUID } from "crypto";
import { Ellipsis, Scale, Trash2 } from "lucide-react";
import { useNotification } from "@/app/context/NotificationContext";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Textarea } from "@/components/ui/textarea";

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
  setSubSectionsData: React.Dispatch<
    React.SetStateAction<
      Record<UUID, IInspectableObjectInspectionFormSubSectionWithData>
    >
  >;
}

export const FormSideBar = ({
  formId,
  mainSubSections,
  setMainSubSections,
  setSubSectionsData,
}: FormSideBarProps) => {
  const { showNotification } = useNotification();

  const [openUpdateMainSectionDialog, setOpenUpdateMainSectionDialog] =
    useState<boolean>(false);
  const [newMainSectionName, setNewMainSectionName] = useState<string>("");
  const [newMainSectionDescription, setNewMainSectionDescription] =
    useState<string>("");

  const [openCreateSubSectionDialog, setOpenCreateSubSectionDialog] =
    useState<boolean>(false);
  const [openUpdateSubSectionDialog, setOpenUpdateSubSectionDialog] =
    useState<boolean>(false);
  const [newSubSectionName, setNewSubSectionName] = useState<string>("");
  const [newSubSectionDescription, setNewSubSectionDescription] =
    useState<string>("");

  const [selectedSubSection, setSelectedSubSection] =
    useState<IInspectableObjectInspectionFormSubSectionResponse>();

  const [selectedMainSection, setSelectedMainSection] =
    useState<IInspectableObjectInspectionFormMainSectionResponse>();

  const scrollToSection = (id: UUID) => {
    const section = document.getElementById(id);
    if (section) {
      const rect = section.getBoundingClientRect(); // Get section position
      const scrollOffset = window.scrollY + rect.top - window.innerHeight * 0.2; // 3/4 of viewport
      window.scrollTo({ top: scrollOffset, behavior: "smooth" });
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

  const handleDeleteMainSection = async (mainSectionId: UUID) => {
    const {
      inspectableObjectInspectionFormMainSection,
      inspectableObjectInspectionFormMainSectionError,
    } = await deleteMainSection(mainSectionId);

    if (inspectableObjectInspectionFormMainSectionError) {
      showNotification(
        "Delete main section",
        `Error: ${inspectableObjectInspectionFormMainSectionError.message} (${inspectableObjectInspectionFormMainSectionError.code})`,
        "error"
      );
    } else if (inspectableObjectInspectionFormMainSection) {
      const copyOfMainSubSections = mainSubSections.filter(
        (mainSubSection) =>
          mainSubSection.id !== inspectableObjectInspectionFormMainSection.id
      );

      handleMainSectionReorder(copyOfMainSubSections);

      showNotification(
        "Delete main section",
        `Successfully deleted new main section with id '${inspectableObjectInspectionFormMainSection.id}'`,
        "info"
      );
    }
  };

  const handleUpdateMainSection = async (
    mainSection: IInspectableObjectInspectionFormMainSectionResponse,
    newName: string,
    newDescription: string
  ) => {
    console.log("update main section");
    const {
      updatedInspectableObjectInspectionFormMainSection,
      updatedInspectableObjectInspectionFormMainSectionError,
    } = await updateMainSection(mainSection.id, newName, newDescription);

    if (updatedInspectableObjectInspectionFormMainSectionError) {
      showNotification(
        "Update main section",
        `Error: ${updatedInspectableObjectInspectionFormMainSectionError.message} (${updatedInspectableObjectInspectionFormMainSectionError.code})`,
        "error"
      );
    } else if (updatedInspectableObjectInspectionFormMainSection) {
      const copyOfMainSectionsWithSubSections = mainSubSections.map(
        (mainSubSection) =>
          mainSubSection.id ===
          updatedInspectableObjectInspectionFormMainSection.id
            ? { ...mainSubSection, name: newName, description: newDescription }
            : mainSubSection
      );

      setMainSubSections(copyOfMainSectionsWithSubSections);
      setNewMainSectionName("");
      setNewMainSectionDescription("");
      setOpenUpdateMainSectionDialog(false);
      showNotification(
        "Update main section",
        `Successfully updated main section with id '${updatedInspectableObjectInspectionFormMainSection.id}'`,
        "info"
      );
    }
  };

  function compareMainSections(
    a: IInspectableObjectInspectionFormMainSectionWithSubSection,
    b: IInspectableObjectInspectionFormMainSectionWithSubSection
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  // Sub section functions

  const updateSubSectionOrderInDB = async (
    updatedItems: IInspectableObjectInspectionFormSubSectionResponse[]
  ) => {
    const {
      updatedInspectableObjectInspectionFormSubSections,
      updatedInspectableObjectInspectionFormSubSectionsError,
    } = await updateSubSectionOrder(updatedItems);

    if (updatedInspectableObjectInspectionFormSubSectionsError) {
      showNotification(
        "Sub section order",
        `Error: ${updatedInspectableObjectInspectionFormSubSectionsError.message} (${updatedInspectableObjectInspectionFormSubSectionsError.code})`,
        "error"
      );
    }
  };

  const debouncedSubSectionUpdate = debounce(updateSubSectionOrderInDB, 500);

  const reorderSubSections = (
    newOrder: IInspectableObjectInspectionFormSubSectionResponse[],
    currentMainSection: UUID
  ) => {
    const copyOfMainSectionsWithSubSections: IInspectableObjectInspectionFormMainSectionWithSubSection[] =
      [...mainSubSections];

    const orderdItems = newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1,
    }));

    for (let i = 0; i < copyOfMainSectionsWithSubSections.length; i++) {
      if (copyOfMainSectionsWithSubSections[i].id === currentMainSection) {
        copyOfMainSectionsWithSubSections[
          i
        ].inspectable_object_inspection_form_sub_section = orderdItems;
        break;
      }
    }

    return {
      updatedMainSubSections: copyOfMainSectionsWithSubSections,
      updatedSubSections: orderdItems,
    };
  };

  const handleSubSectionReorder = (
    newOrder: IInspectableObjectInspectionFormSubSectionResponse[]
  ) => {
    const currentMainSection = newOrder[0].main_section_id;

    const { updatedMainSubSections, updatedSubSections } = reorderSubSections(
      newOrder,
      currentMainSection
    );

    setMainSubSections(updatedMainSubSections);
    debouncedSubSectionUpdate(updatedSubSections);
  };

  const handleCreateSubSection = async () => {
    if (!selectedMainSection) return;

    let subSectionOrderNumber = 0;
    mainSubSections.forEach((mainSubSection) => {
      if (mainSubSection.id === selectedMainSection.id) {
        subSectionOrderNumber =
          mainSubSection.inspectable_object_inspection_form_sub_section.length +
          1;
        return;
      }
    });

    const newSubSection: IInspectableObjectInspectionFormSubSectionInsert = {
      name: newSubSectionName,
      description: newSubSectionDescription,
      main_section_id: selectedMainSection.id,
      order_number: subSectionOrderNumber,
    };

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
      setSubSectionsData((prev) => {
        const copy = { ...prev };

        copy[inspectableObjectInspectionFormSubSection.id] =
          inspectableObjectInspectionFormSubSection;

        return copy;
      });

      setMainSubSections(copyOfMainSubSections);
      setNewSubSectionName("");
      setNewSubSectionDescription("");
      setOpenUpdateSubSectionDialog(false);
      showNotification(
        "Create sub section",
        `Successfully created new sub section with id'${inspectableObjectInspectionFormSubSection.id}'`,
        "info"
      );
    }
  };

  const handleDeleteSubSection = async (subSectionId: UUID) => {
    const {
      inspectableObjectInspectionFormSubSection,
      inspectableObjectInspectionFormSubSectionError,
    } = await deleteSubSection(subSectionId);
    if (inspectableObjectInspectionFormSubSectionError) {
      showNotification(
        "Delete sub section",
        `Error: ${inspectableObjectInspectionFormSubSectionError.message} (${inspectableObjectInspectionFormSubSectionError.code})`,
        "error"
      );
    } else if (inspectableObjectInspectionFormSubSection) {
      const copyOfMainSubSections = [...mainSubSections];
      for (let index = 0; index < copyOfMainSubSections.length; index++) {
        if (
          copyOfMainSubSections[index].id ===
          inspectableObjectInspectionFormSubSection.main_section_id
        ) {
          const newSubSectionList = copyOfMainSubSections[
            index
          ].inspectable_object_inspection_form_sub_section.filter(
            (sub) => sub.id !== inspectableObjectInspectionFormSubSection.id
          );
          const { updatedMainSubSections, updatedSubSections } =
            reorderSubSections(
              newSubSectionList,
              inspectableObjectInspectionFormSubSection.main_section_id
            );

          setSubSectionsData((prev) => {
            const copy = { ...prev };
            delete copy[inspectableObjectInspectionFormSubSection.id];
            return copy;
          });
          setMainSubSections(updatedMainSubSections);
          debouncedSubSectionUpdate(updatedSubSections);
          break;
        }
      }

      showNotification(
        "Delete sub section",
        `Successfully deleted subsection with id '${inspectableObjectInspectionFormSubSection.id}'`,
        "info"
      );
    }
  };

  const handleUpdateSubSection = async (
    subSection: IInspectableObjectInspectionFormSubSectionResponse,
    newName: string,
    newDescription: string
  ) => {
    const {
      updatedInspectableObjectInspectionFormSubSection,
      updatedInspectableObjectInspectionFormSubSectionError,
    } = await updateSubSection(subSection.id, newName, newDescription);
    if (updatedInspectableObjectInspectionFormSubSectionError) {
      showNotification(
        "Delete sub section",
        `Error: ${updatedInspectableObjectInspectionFormSubSectionError.message} (${updatedInspectableObjectInspectionFormSubSectionError.code})`,
        "error"
      );
    } else if (updatedInspectableObjectInspectionFormSubSection) {
      const copyOfMainSubSections = [...mainSubSections];

      for (let index = 0; index < copyOfMainSubSections.length; index++) {
        if (
          copyOfMainSubSections[index].id ===
          updatedInspectableObjectInspectionFormSubSection.main_section_id
        ) {
          copyOfMainSubSections[
            index
          ].inspectable_object_inspection_form_sub_section =
            copyOfMainSubSections[
              index
            ].inspectable_object_inspection_form_sub_section.map((sub) =>
              sub.id === updatedInspectableObjectInspectionFormSubSection.id
                ? { ...sub, name: newName, description: newDescription }
                : sub
            );
        }
      }

      setMainSubSections(copyOfMainSubSections);
      setNewSubSectionName("");
      setNewSubSectionDescription("");
      setOpenUpdateSubSectionDialog(false);
      showNotification(
        "Update sub section",
        `Successfully updated subsection with id '${updatedInspectableObjectInspectionFormSubSection.id}'`,
        "info"
      );
    }
  };

  function compareSubSections(
    a: IInspectableObjectInspectionFormSubSectionResponse,
    b: IInspectableObjectInspectionFormSubSectionResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <div>
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
            className=" bg-white p-4 rounded-md cursor-grab "
            dragConstraints={{ top: 0, bottom: 0 }}
          >
            <ContextMenu modal={false}>
              <ContextMenuTrigger>
                <div className="flex">
                  <span className="text-gray-500 font-bold w-6">
                    {mainSubSection.order_number}.
                  </span>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <p
                          onClick={() => scrollToSection(mainSubSection.id)}
                          className="text-slate-600 font-bold"
                        >
                          {mainSubSection.name}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{mainSubSection.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={() => {
                    setSelectedMainSection(mainSubSection);
                    setNewSubSectionName("");
                    setNewSubSectionDescription("");
                    setOpenCreateSubSectionDialog(true);
                  }}
                >
                  create sub section
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    setSelectedMainSection(mainSubSection);
                    setNewMainSectionName(mainSubSection.name);
                    setNewMainSectionDescription(mainSubSection.description);
                    setOpenUpdateMainSectionDialog(true);
                  }}
                >
                  update
                </ContextMenuItem>
                <ContextMenuItem
                  className="text-red-600"
                  onClick={() => {
                    handleDeleteMainSection(mainSubSection.id);
                  }}
                >
                  delete <Trash2></Trash2>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <div>
              <Reorder.Group
                axis="y"
                values={
                  mainSubSection.inspectable_object_inspection_form_sub_section
                }
                onReorder={handleSubSectionReorder}
                className={`space-y-2  p-2 cursor-default `}
              >
                {mainSubSection.inspectable_object_inspection_form_sub_section
                  .sort(compareSubSections)
                  .map((subSection) => (
                    <Reorder.Item
                      key={subSection.id}
                      value={subSection}
                      dragConstraints={{ top: 0, bottom: 0 }}
                    >
                      <ContextMenu modal={false}>
                        <ContextMenuTrigger>
                          <div className="flex items-center bg-white border p-4 rounded-md shadow cursor-grab">
                            <span className="text-gray-500 font-bold w-6">
                              {subSection.order_number}.
                            </span>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <p
                                    onClick={() => {
                                      scrollToSection(subSection.id);
                                    }}
                                    className="text-slate-600 font-bold"
                                  >
                                    {subSection.name}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{subSection.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={() => {
                              setSelectedSubSection(subSection);
                              setNewSubSectionName(subSection.name);
                              setNewSubSectionDescription(
                                subSection.description
                              );
                              setOpenUpdateSubSectionDialog(true);
                            }}
                          >
                            update
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="text-red-600"
                            onClick={() => {
                              handleDeleteSubSection(subSection.id);
                            }}
                          >
                            delete <Trash2></Trash2>
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </Reorder.Item>
                  ))}
              </Reorder.Group>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <Dialog
        open={openCreateSubSectionDialog}
        onOpenChange={setOpenCreateSubSectionDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create</DialogTitle>
            <DialogDescription>Create new sub section</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="createSubSectionName">Name</Label>
              <Input
                id="createSubSectionName"
                value={newSubSectionName} // Controlled input
                onChange={(e) => setNewSubSectionName(e.target.value)} // Update state on input change
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSubSectionName.length > 3)
                    handleCreateSubSection();
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="createSubSectionDescription">Description</Label>
              <Textarea
                id="createSubSectionDescription"
                value={newSubSectionDescription}
                onChange={(e) => setNewSubSectionDescription(e.target.value)}
                placeholder="Enter sub section description (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            {newSubSectionName.length > 3 ? (
              <Button
                onClick={() => {
                  handleCreateSubSection();
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
        open={openUpdateMainSectionDialog}
        onOpenChange={setOpenUpdateMainSectionDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update</DialogTitle>
            <DialogDescription>Update main section</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="createMainSectionName">Name</Label>
              <Input
                id="createMainSectionName"
                value={newMainSectionName} // Controlled input
                onChange={(e) => setNewMainSectionName(e.target.value)} // Update state on input change
                className="col-span-3"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    newMainSectionName.length > 3 &&
                    selectedMainSection
                  )
                    handleUpdateMainSection(
                      selectedMainSection,
                      newMainSectionName,
                      newMainSectionDescription
                    );
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="createMainSectionDescription">Description</Label>
              <Textarea
                id="createMainSectionDescription"
                value={newMainSectionDescription}
                onChange={(e) => setNewMainSectionDescription(e.target.value)}
                placeholder="Enter sub section description (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            {newMainSectionName.length > 3 ? (
              <Button
                onClick={() => {
                  if (selectedMainSection) {
                    handleUpdateMainSection(
                      selectedMainSection,
                      newMainSectionName,
                      newMainSectionDescription
                    );
                  }
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
        open={openUpdateSubSectionDialog}
        onOpenChange={setOpenUpdateSubSectionDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update</DialogTitle>
            <DialogDescription>Update new sub section</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="updateSubSectionName">Name</Label>
              <Input
                id="updateSubSectionName"
                value={newSubSectionName} // Controlled input
                onChange={(e) => setNewSubSectionName(e.target.value)} // Update state on input change
                className="col-span-3"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    newSubSectionName.length > 3 &&
                    selectedSubSection
                  )
                    handleUpdateSubSection(
                      selectedSubSection,
                      newSubSectionName,
                      newSubSectionDescription
                    );
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="updateSubSectionDescription">Description</Label>
              <Textarea
                id="updateSubSectionDescription"
                value={newSubSectionDescription}
                onChange={(e) => setNewSubSectionDescription(e.target.value)}
                placeholder="Enter sub section description (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            {newSubSectionName.length > 3 ? (
              <Button
                onClick={() => {
                  if (selectedSubSection) {
                    handleUpdateSubSection(
                      selectedSubSection,
                      newSubSectionName,
                      newSubSectionDescription
                    );
                  }
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
