import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UUID } from "crypto";
import { Button } from "@/components/ui/button";
import {
  IFormCheckboxGroupWithCheckboxes,
  IFormCheckboxInsert,
  IFormCheckboxResponse,
  IFormCheckboxTaskInsert,
  IFormCheckboxTaskResponse,
  IFormTextInputFieldInsert,
  IFormTextInputFieldResponse,
  IInspectableObjectInspectionFormAnnotationResponse,
  IInspectableObjectInspectionFormSubSectionWithData,
  IStringExtractionTrainingResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import {
  createCheckbox,
  createCheckboxTask,
  createTextInputField,
  deleteCheckbox,
  deleteCheckboxTask,
  deleteTextInputField,
  fetchStringExtractionTrainings,
  updateCheckboxGroupRules,
  updateCheckboxTaskOrder,
  updateTextInputFieldTraining,
  upsertCheckboxes,
  upsertTextInputFields,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Plus, SquareCheck, Trash2, TriangleAlert } from "lucide-react";
import { Reorder } from "framer-motion";
import { validate as isValidUUID } from "uuid";

import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

function sortAnnotations(
  a: IInspectableObjectInspectionFormAnnotationResponse,
  b: IInspectableObjectInspectionFormAnnotationResponse
) {
  const numA = Number(a.content);
  const numB = Number(b.content);

  const isNumA = !isNaN(numA);
  const isNumB = !isNaN(numB);

  if (isNumA && isNumB) {
    return numA - numB; // numeric comparison
  }

  // fallback to string comparison
  return a.content.localeCompare(b.content);
}

interface TaskDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentCheckboxGroupId: UUID;
  subSectionsData: Record<
    UUID,
    IInspectableObjectInspectionFormSubSectionWithData
  >;
  setSubSectionsData: React.Dispatch<
    React.SetStateAction<
      Record<UUID, IInspectableObjectInspectionFormSubSectionWithData>
    >
  >;
  subSectionId: UUID;
}

export const TaskDialog = ({
  open,
  setOpen,
  currentCheckboxGroupId,
  subSectionsData,
  setSubSectionsData,
  subSectionId,
}: TaskDialogProps) => {
  const { showNotification } = useNotification();

  const [newTaskDescription, setNewTaskDescription] = useState<string>("");

  const currentTaskListLenght = () => {
    const checkboxGroup = subSectionsData[
      subSectionId
    ].form_checkbox_group.filter(
      (group) => group.id === currentCheckboxGroupId
    )[0];

    if (checkboxGroup) {
      return subSectionsData[subSectionId].form_checkbox_group.filter(
        (group) => group.id === currentCheckboxGroupId
      )[0].form_checkbox_task.length;
    } else {
      return 0;
    }
  };

  const handleCreateTask = async () => {
    const newTask: IFormCheckboxTaskInsert = {
      description: newTaskDescription,
      group_id: currentCheckboxGroupId,
      order_number: currentTaskListLenght() + 1,
    };
    const { formCheckboxTask, formCheckboxTaskError } =
      await createCheckboxTask(newTask);

    if (formCheckboxTaskError) {
      showNotification(
        "Task",
        `Error: ${formCheckboxTaskError.message} (${formCheckboxTaskError.code})`,
        "error"
      );
      return;
    } else if (formCheckboxTask) {
      const copy = { ...subSectionsData };

      copy[subSectionId].form_checkbox_group
        .filter((group) => group.id === currentCheckboxGroupId)[0]
        .form_checkbox_task.push(formCheckboxTask);

      setSubSectionsData(copy);
    }
  };

  function compareTaskOrder(
    a: IFormCheckboxTaskResponse,
    b: IFormCheckboxTaskResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  const updateCheckboxTaskOrderInDB = async (
    updatedItems: IFormCheckboxTaskResponse[]
  ) => {
    const { updatedFormCheckboxTasks, updatedFormCheckboxTasksError } =
      await updateCheckboxTaskOrder(updatedItems);

    if (updatedFormCheckboxTasksError) {
      showNotification(
        "Checkbox task reorder",
        `Error: ${updatedFormCheckboxTasksError.message} (${updatedFormCheckboxTasksError.code})`,
        "error"
      );
    }
  };

  const debouncedMainSectionUpdate = debounce(updateCheckboxTaskOrderInDB, 500);

  const reorderItems = (newOrder: IFormCheckboxTaskResponse[]) => {
    return newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1,
    }));
  };

  const handleTaskReorder = (newOrder: IFormCheckboxTaskResponse[]) => {
    const updatedItems = reorderItems(newOrder);
    setSubSectionsData((prevData) => {
      const copy = { ...prevData };
      const groupIndex = copy[subSectionId].form_checkbox_group.findIndex(
        (group) => group.id === currentCheckboxGroupId
      );
      if (groupIndex !== -1) {
        copy[subSectionId].form_checkbox_group[groupIndex].form_checkbox_task =
          updatedItems;
      }
      return copy;
    });
    debouncedMainSectionUpdate(updatedItems);
  };

  const handleDeleteTask = async (taskId: UUID) => {
    const { deletedFormCheckboxTask, deletedFormCheckboxTaskError } =
      await deleteCheckboxTask(taskId);
    if (deletedFormCheckboxTaskError) {
      showNotification(
        "Delete task",
        `Error: ${deletedFormCheckboxTaskError.message} (${deletedFormCheckboxTaskError.code})`,
        "error"
      );
    } else if (deletedFormCheckboxTask) {
      const copy = { ...subSectionsData };

      const newOrder = reorderItems(
        copy[subSectionId].form_checkbox_group
          .filter((group) => group.id === currentCheckboxGroupId)[0]
          .form_checkbox_task.filter(
            (task) => task.id !== deletedFormCheckboxTask.id
          )
      );

      copy[subSectionId].form_checkbox_group.filter(
        (group) => group.id === currentCheckboxGroupId
      )[0].form_checkbox_task = newOrder;

      debouncedMainSectionUpdate(newOrder);
      setSubSectionsData(copy);
    }
  };

  function groupExists() {
    return subSectionsData[subSectionId].form_checkbox_group.filter(
      (group) => group.id === currentCheckboxGroupId
    )[0]
      ? true
      : false;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Manage Checkboxe Tasks</DialogTitle>
          <DialogDescription>
            Create/Update tasks that needs to be fullfilled to finish sub
            section.
          </DialogDescription>
        </DialogHeader>
        {groupExists() && (
          <>
            <div>
              <Label htmlFor={`task-dialog-${currentCheckboxGroupId}`}>
                New Task
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id={`task-dialog-${currentCheckboxGroupId}`}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateTask();
                  }}
                />
                <Button onClick={() => handleCreateTask()}>Create</Button>
              </div>
            </div>
            {currentTaskListLenght() < 1 ? (
              <div className="border-2 rounded-xl min-h-11 flex items-center justify-center">
                <p className="text-sm text-slate-500">No task created yet</p>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={
                  subSectionsData[subSectionId].form_checkbox_group.filter(
                    (group) => group.id === currentCheckboxGroupId
                  )[0].form_checkbox_task
                }
                onReorder={handleTaskReorder}
                className={`p-2 space-y-3 `}
              >
                {subSectionsData[subSectionId].form_checkbox_group
                  .filter((group) => group.id === currentCheckboxGroupId)[0]
                  .form_checkbox_task.sort(compareTaskOrder)
                  .map((task) => (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      className=" flex items-center justify-between bg-white border p-4 rounded-md shadow cursor-grab "
                      dragConstraints={{ top: 0, bottom: 0 }}
                    >
                      <div className="flex items-center space-x-3">
                        <p className="text-slate-700 font-bold">
                          {task.order_number}.
                        </p>
                        <p>{task.description}</p>
                      </div>
                      <button onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="text-red-500 "></Trash2>
                      </button>
                    </Reorder.Item>
                  ))}
              </Reorder.Group>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface CheckboxGroupDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentCheckboxGroupId: UUID;

  subSectionsData: Record<
    UUID,
    IInspectableObjectInspectionFormSubSectionWithData
  >;
  setSubSectionsData: React.Dispatch<
    React.SetStateAction<
      Record<UUID, IInspectableObjectInspectionFormSubSectionWithData>
    >
  >;
  subSectionId: UUID;
  annotations: IInspectableObjectInspectionFormAnnotationResponse[];
  setAllreadyAssignedAnnoations: React.Dispatch<React.SetStateAction<UUID[]>>;
  allreadyAssignedAnnoations: UUID[];
}

export const CheckboxGroupDialog = ({
  open,
  setOpen,
  currentCheckboxGroupId,
  subSectionsData,
  setSubSectionsData,
  subSectionId,
  annotations,
  allreadyAssignedAnnoations,
  setAllreadyAssignedAnnoations,
}: CheckboxGroupDialogProps) => {
  const { showNotification } = useNotification();

  const [newCheckboxLabel, setNewCheckboxLabel] = useState<string>("");

  const currentCheckboxGroupCheckboxes = () => {
    return subSectionsData[subSectionId].form_checkbox_group.filter(
      (group) => group.id === currentCheckboxGroupId
    )[0].form_checkbox;
  };

  const currentCheckboxGroup = () => {
    return subSectionsData[subSectionId].form_checkbox_group.filter(
      (group) => group.id === currentCheckboxGroupId
    )[0];
  };

  const updateCheckboxOrderInDB = async (
    updatedItems: IFormCheckboxResponse[]
  ) => {
    const { updatedFormCheckboxes, updatedFormCheckboxesError } =
      await upsertCheckboxes(updatedItems);

    if (updatedFormCheckboxesError) {
      showNotification(
        "Checkbox order",
        `Error: ${updatedFormCheckboxesError.message} (${updatedFormCheckboxesError.code})`,
        "error"
      );
    }
  };

  const updateCheckboxPrioOrderInDB = async (
    updatedItems: IFormCheckboxResponse[]
  ) => {
    const { updatedFormCheckboxes, updatedFormCheckboxesError } =
      await upsertCheckboxes(updatedItems);

    if (updatedFormCheckboxesError) {
      showNotification(
        "Checkbox prio order",
        `Error: ${updatedFormCheckboxesError.message} (${updatedFormCheckboxesError.code})`,
        "error"
      );
    }
  };

  const debouncedCheckboxUpdate = debounce(updateCheckboxOrderInDB, 500);
  const debouncedCheckboxPrioNumberUpdate = debounce(
    updateCheckboxPrioOrderInDB,
    500
  );

  const reorderItems = (newOrder: IFormCheckboxResponse[]) => {
    return newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1,
    }));
  };

  const reorderPrioItems = (newOrder: IFormCheckboxResponse[]) => {
    return newOrder.map((item, index) => ({
      ...item,
      prio_number: index + 1,
    }));
  };

  const handleCheckboxesReorder = (newOrder: IFormCheckboxResponse[]) => {
    const updatedItems = reorderItems(newOrder);

    const copy = { ...subSectionsData };
    copy[subSectionId].form_checkbox_group.filter(
      (group) => group.id === currentCheckboxGroupId
    )[0].form_checkbox = updatedItems;

    setSubSectionsData(copy);

    debouncedCheckboxUpdate(updatedItems);
  };

  const handleCheckboxesPrioReorder = (newOrder: IFormCheckboxResponse[]) => {
    const updatedItems = reorderPrioItems(newOrder);

    const copy = { ...subSectionsData };
    copy[subSectionId].form_checkbox_group.filter(
      (group) => group.id === currentCheckboxGroupId
    )[0].form_checkbox = updatedItems;

    setSubSectionsData(copy);

    debouncedCheckboxPrioNumberUpdate(updatedItems);
  };

  function compareCheckboxOrderNumbers(
    a: IFormCheckboxResponse,
    b: IFormCheckboxResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  function compareCheckboxPrioNumbers(
    a: IFormCheckboxResponse,
    b: IFormCheckboxResponse
  ) {
    if (a.prio_number < b.prio_number) return -1;

    if (a.prio_number > b.prio_number) return 1;

    return 0;
  }

  const handleCheckboxDelete = async (checkboxId: UUID) => {
    const { deletedFormCheckbox, deletedFormCheckboxError } =
      await deleteCheckbox(checkboxId);

    if (deletedFormCheckboxError) {
      showNotification(
        "Delete checkbox",
        `Error: ${deletedFormCheckboxError.message} (${deletedFormCheckboxError.code})`,
        "error"
      );
    } else if (deletedFormCheckbox) {
      const copy = { ...subSectionsData };
      copy[subSectionId].form_checkbox_group.filter(
        (group) => group.id === currentCheckboxGroupId
      )[0].form_checkbox = copy[subSectionId].form_checkbox_group
        .filter((group) => group.id === currentCheckboxGroupId)[0]
        .form_checkbox.filter(
          (checkbox) => checkbox.id !== deletedFormCheckbox.id
        );

      setSubSectionsData(copy);
    }
  };

  const handleCreateCheckbox = async () => {
    const newCheckbox: IFormCheckboxInsert = {
      label: newCheckboxLabel,
      group_id: currentCheckboxGroupId,
      order_number: currentCheckboxGroupCheckboxes().length + 1,
      annotation_id: null,
      prio_number: currentCheckboxGroupCheckboxes().length + 1,
    };
    const { formCheckbox, formCheckboxError } = await createCheckbox(
      newCheckbox
    );

    if (formCheckboxError) {
      showNotification(
        "Checkbox create",
        `Error: ${formCheckboxError.message} (${formCheckboxError.code})`,
        "error"
      );
    } else if (formCheckbox) {
      const copy = { ...subSectionsData };
      copy[subSectionId].form_checkbox_group
        .filter((group) => group.id === currentCheckboxGroupId)[0]
        .form_checkbox.push(formCheckbox);

      setSubSectionsData(copy);
    }
  };

  function groupExists() {
    return subSectionsData[subSectionId].form_checkbox_group.filter(
      (group) => group.id === currentCheckboxGroupId
    )[0]
      ? true
      : false;
  }

  function checkboxRulesIsSelected(checkboxId: UUID) {
    const result =
      currentCheckboxGroup().checkboxes_selected_together?.includes(checkboxId);

    return result ?? false;
  }

  const checkboxRulesCheck = async (checkboxId: UUID) => {
    let newList;

    if (checkboxRulesIsSelected(checkboxId)) {
      const copy = { ...subSectionsData };

      newList = copy[subSectionId].form_checkbox_group
        .filter((group) => group.id === currentCheckboxGroupId)[0]
        .checkboxes_selected_together?.filter((id) => id !== checkboxId);

      copy[subSectionId].form_checkbox_group.filter(
        (group) => group.id === currentCheckboxGroupId
      )[0].checkboxes_selected_together = newList ? newList : null;

      setSubSectionsData(copy);
    } else {
      const copy = { ...subSectionsData };

      newList = copy[subSectionId].form_checkbox_group.filter(
        (group) => group.id === currentCheckboxGroupId
      )[0].checkboxes_selected_together;

      if (newList) {
        newList.push(checkboxId);
      } else {
        newList = [];
        newList.push(checkboxId);
      }
      copy[subSectionId].form_checkbox_group.filter(
        (group) => group.id === currentCheckboxGroupId
      )[0].checkboxes_selected_together = newList;

      setSubSectionsData(copy);
    }

    const { updatedCheckboxGroup, updatedCheckboxGroupError } =
      await updateCheckboxGroupRules(
        currentCheckboxGroupId,
        (newList as UUID[]) ?? null
      );
    if (updatedCheckboxGroupError) {
      showNotification(
        "Update rules",
        `Error: ${updatedCheckboxGroupError.message} (${updatedCheckboxGroupError.code})`,
        "error"
      );
    }
  };

  const assignAnnotationToCheckbox = async (
    annotationId: UUID,
    checkboxId: UUID
  ) => {
    let updateableCheckbox = null;
    let prevAnnotation: UUID | null = null;
    const copy = { ...subSectionsData };
    copy[subSectionId].form_checkbox_group.filter(
      (group) => group.id === currentCheckboxGroupId
    )[0].form_checkbox = currentCheckboxGroupCheckboxes().map((checkbox) => {
      if (checkbox.id === checkboxId) {
        prevAnnotation = checkbox.annotation_id;
        checkbox.annotation_id = annotationId;
        updateableCheckbox = checkbox;
      }
      return checkbox;
    });

    let copyAllreadyAssignedAnnotations = [...allreadyAssignedAnnoations];

    if (
      prevAnnotation &&
      copyAllreadyAssignedAnnotations.includes(prevAnnotation)
    ) {
      copyAllreadyAssignedAnnotations = copyAllreadyAssignedAnnotations.filter(
        (annoId) => annoId !== prevAnnotation
      );
    }
    if (!copyAllreadyAssignedAnnotations.includes(annotationId)) {
      copyAllreadyAssignedAnnotations.push(annotationId);
    }
    setAllreadyAssignedAnnoations(copyAllreadyAssignedAnnotations);

    setSubSectionsData(copy);
    if (updateableCheckbox) await upsertCheckboxes([updateableCheckbox]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px]">
        {groupExists() && (
          <>
            <DialogHeader>
              <DialogTitle>
                Manage Checkbox Group{" "}
                {
                  subSectionsData[subSectionId].form_checkbox_group.filter(
                    (group) => group.id === currentCheckboxGroupId
                  )[0].name
                }
              </DialogTitle>
              <DialogDescription>
                Create/Update {currentCheckboxGroupCheckboxes().length} checkbox
                {currentCheckboxGroupCheckboxes().length !== 1 ? "es" : ""}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="checkboxes">
              <TabsList>
                <TabsTrigger value="checkboxes">Checkboxes</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="prioritization">Prioritization</TabsTrigger>
              </TabsList>
              <TabsContent value="checkboxes">
                <div className="mb-2">
                  <Label htmlFor={`task-dialog-${currentCheckboxGroupId}`}>
                    New Checkbox
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`task-dialog-${currentCheckboxGroupId}`}
                      value={newCheckboxLabel}
                      onChange={(e) => setNewCheckboxLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateCheckbox();
                      }}
                    />
                    <Button
                      onClick={() => {
                        handleCreateCheckbox();
                      }}
                    >
                      Create
                    </Button>
                  </div>
                </div>
                {currentCheckboxGroupCheckboxes().length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No checkboxes in this group.
                  </p>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={
                      subSectionsData[subSectionId].form_checkbox_group.filter(
                        (group) => group.id === currentCheckboxGroupId
                      )[0].form_checkbox
                    }
                    onReorder={handleCheckboxesReorder}
                    className="p-2 space-y-3"
                  >
                    {currentCheckboxGroupCheckboxes()
                      .sort(compareCheckboxOrderNumbers)
                      .map((checkbox) => (
                        <Reorder.Item
                          key={checkbox.id}
                          value={checkbox}
                          className=""
                          dragConstraints={{ top: 0, bottom: 0 }}
                        >
                          <div className="flex items-center space-x-3">
                            <p className="text-slate-600">
                              {checkbox.order_number}.
                            </p>
                            <div className="flex items-center justify-between bg-white border p-4 rounded-md shadow cursor-grab w-full">
                              <div className="flex items-center space-x-3">
                                <SquareCheck></SquareCheck>
                                <Label
                                  className="font-bold"
                                  htmlFor={`preview-${currentCheckboxGroupId}-${checkbox.id}`}
                                >
                                  {checkbox.label}
                                </Label>
                              </div>
                              <div className="flex space-x-2 items-center">
                                <div className="flex items-center space-x-2">
                                  <Label
                                    htmlFor={
                                      checkbox.id + "annotationSelection"
                                    }
                                  >
                                    ID:
                                  </Label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger className="border-2 p-1 rounded-xl w-16 h-9">
                                      <p className="truncate">
                                        {checkbox.annotation_id
                                          ? annotations.filter(
                                              (annotation) =>
                                                annotation.id ===
                                                checkbox.annotation_id
                                            )[0].content
                                          : ""}
                                      </p>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuLabel>
                                        Available IDs
                                      </DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <ScrollArea className="h-52">
                                        {annotations
                                          .filter(
                                            (anno) =>
                                              !allreadyAssignedAnnoations.includes(
                                                anno.id
                                              )
                                          )
                                          .sort(sortAnnotations)
                                          .map((annotation) => (
                                            <DropdownMenuItem
                                              key={annotation.id}
                                              onClick={() =>
                                                assignAnnotationToCheckbox(
                                                  annotation.id,
                                                  checkbox.id
                                                )
                                              }
                                            >
                                              {annotation.content}
                                            </DropdownMenuItem>
                                          ))}
                                      </ScrollArea>
                                    </DropdownMenuContent>
                                  </DropdownMenu>

                                  <TriangleAlert
                                    className={`${
                                      checkbox.annotation_id && "opacity-0"
                                    }`}
                                  ></TriangleAlert>
                                </div>
                                <button
                                  onClick={() =>
                                    handleCheckboxDelete(checkbox.id)
                                  }
                                >
                                  <Trash2 className="text-red-500 cursor-pointer hover:text-red-700"></Trash2>
                                </button>
                              </div>
                            </div>
                          </div>
                        </Reorder.Item>
                      ))}
                  </Reorder.Group>
                )}
              </TabsContent>
              <TabsContent value="rules">
                <p className="mb-2">
                  Only selected checkboxes can be checked together:{" "}
                  {currentCheckboxGroupCheckboxes()
                    .filter((checkbox) =>
                      currentCheckboxGroup().checkboxes_selected_together?.includes(
                        checkbox.id
                      )
                    )
                    .map((checkbox, index, array) => (
                      <span key={checkbox.id + "rulesDescription"}>
                        <span className="font-bold underline">
                          {checkbox.label}
                        </span>
                        {index < array.length - 1 ? " , " : ""}
                      </span>
                    ))}
                </p>

                <ul className="space-y-3 p-2">
                  {currentCheckboxGroupCheckboxes()
                    .sort(compareCheckboxOrderNumbers)
                    .map((checkbox) => {
                      return (
                        <li
                          key={checkbox.id + "rules"}
                          className="border p-4 rounded-md shadow"
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={checkboxRulesIsSelected(checkbox.id)}
                              onClick={() => checkboxRulesCheck(checkbox.id)}
                              id={`previewtest-${currentCheckboxGroupId}-${checkbox.id}`}
                            />
                            <Label
                              className="font-bold"
                              htmlFor={`previewtest-${currentCheckboxGroupId}-${checkbox.id}`}
                            >
                              {checkbox.label}
                            </Label>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </TabsContent>
              <TabsContent value="prioritization">
                <p>Set prioritization order</p>
                {currentCheckboxGroupCheckboxes().length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No checkboxes in this group.
                  </p>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={
                      subSectionsData[subSectionId].form_checkbox_group.filter(
                        (group) => group.id === currentCheckboxGroupId
                      )[0].form_checkbox
                    }
                    onReorder={handleCheckboxesPrioReorder}
                    className="p-2 space-y-3"
                  >
                    {currentCheckboxGroupCheckboxes()
                      .sort(compareCheckboxPrioNumbers)
                      .map((checkbox) => (
                        <Reorder.Item
                          key={checkbox.id}
                          value={checkbox}
                          className=""
                          dragConstraints={{ top: 0, bottom: 0 }}
                        >
                          <div className="flex items-center space-x-3 w-full ">
                            <p className="text-slate-600">
                              {checkbox.prio_number}.
                            </p>
                            <div className="flex items-center space-x-2 bg-white border p-4 rounded-md shadow cursor-grab w-full">
                              <SquareCheck></SquareCheck>
                              <Label
                                htmlFor={`preview-${currentCheckboxGroupId}-${checkbox.id}`}
                                className="font-bold"
                              >
                                {checkbox.label}
                              </Label>
                            </div>
                          </div>
                        </Reorder.Item>
                      ))}
                  </Reorder.Group>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface TextInputFieldsDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  subSectionsData: Record<
    UUID,
    IInspectableObjectInspectionFormSubSectionWithData
  >;
  setSubSectionsData: React.Dispatch<
    React.SetStateAction<
      Record<UUID, IInspectableObjectInspectionFormSubSectionWithData>
    >
  >;
  subSectionId: UUID;
  trainingList: IStringExtractionTrainingResponse[] | undefined;
  annotations: IInspectableObjectInspectionFormAnnotationResponse[];
  setAllreadyAssignedAnnoations: React.Dispatch<React.SetStateAction<UUID[]>>;
  allreadyAssignedAnnoations: UUID[];
}

export const TextInputFieldsDialog = ({
  open,
  setOpen,
  setSubSectionsData,
  subSectionsData,
  subSectionId,
  trainingList,
  annotations,
  allreadyAssignedAnnoations,
  setAllreadyAssignedAnnoations,
}: TextInputFieldsDialogProps) => {
  const { showNotification } = useNotification();

  const [newTextFieldLabel, setNewTextFieldLabel] = useState<string>("");
  const [newTextFieldPlaceHolder, setNewTextFieldPlaceHolder] =
    useState<string>("");

  const [trainingsList, setTrainingsList] = useState<
    IStringExtractionTrainingResponse[]
  >(trainingList ?? []);

  const updateTextInputFieldOrderInDB = async (
    updatedItems: IFormTextInputFieldResponse[]
  ) => {
    const { updatedFormTextInputFields, updatedFormTextInputFieldsError } =
      await upsertTextInputFields(updatedItems);

    if (updatedFormTextInputFieldsError) {
      showNotification(
        "Text input field order",
        `Error: ${updatedFormTextInputFieldsError.message} (${updatedFormTextInputFieldsError.code})`,
        "error"
      );
    } else if (updatedFormTextInputFields) {
    }
  };

  const debouncedTextInputFieldUpdate = debounce(
    updateTextInputFieldOrderInDB,
    500
  );

  const reorderItems = (newOrder: IFormTextInputFieldResponse[]) => {
    return newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1,
    }));
  };

  const handleTextInputFieldReorder = (
    newOrder: IFormTextInputFieldResponse[]
  ) => {
    const updatedItems = reorderItems(newOrder);

    const copy = { ...subSectionsData };
    copy[subSectionId].form_text_input_field = updatedItems;

    setSubSectionsData(copy);

    debouncedTextInputFieldUpdate(updatedItems);
  };

  function compareTextInputFieldOrderNumbers(
    a: IFormTextInputFieldResponse,
    b: IFormTextInputFieldResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  const handleCreateTextInputField = async () => {
    const newField: IFormTextInputFieldInsert = {
      label: newTextFieldLabel,
      placeholder_text: newTextFieldPlaceHolder,
      sub_section_id: subSectionId,
      order_number:
        subSectionsData[subSectionId].form_text_input_field.length + 1,
      annotation_id: null,
      training_id: null,
    };
    const { formTextInputFields, formTextInputFieldsError } =
      await createTextInputField(newField);

    if (formTextInputFieldsError) {
      showNotification(
        "Text input field create",
        `Error: ${formTextInputFieldsError.message} (${formTextInputFieldsError.code})`,
        "error"
      );
    } else if (formTextInputFields) {
      const copy = { ...subSectionsData };
      copy[subSectionId].form_text_input_field.push(formTextInputFields[0]);

      setSubSectionsData(copy);
    }
  };

  const handleDeleteTextField = async (id: UUID) => {
    const { deletedFormTextInputField, deletedFormTextInputFieldError } =
      await deleteTextInputField(id);
    if (deletedFormTextInputFieldError) {
      showNotification(
        "Text input field delete",
        `Error: ${deletedFormTextInputFieldError.message} (${deletedFormTextInputFieldError.code})`,
        "error"
      );
    } else if (deletedFormTextInputField) {
      const copy = { ...subSectionsData };

      const newOrder = reorderItems(
        copy[subSectionId].form_text_input_field.filter(
          (field) => field.id !== deletedFormTextInputField.id
        )
      );
      copy[subSectionId].form_text_input_field = newOrder;

      debouncedTextInputFieldUpdate(newOrder);
      setSubSectionsData(copy);
    }
  };

  const assignAnnotationToTextInputField = async (
    annotationId: UUID,
    textInputId: UUID
  ) => {
    let updateableTextInputField = null;
    let prevAnnotation: UUID | null = null;
    const copy = { ...subSectionsData };
    copy[subSectionId].form_text_input_field = copy[
      subSectionId
    ].form_text_input_field.map((textInput) => {
      if (textInput.id === textInputId) {
        prevAnnotation = textInput.annotation_id;
        textInput.annotation_id = annotationId;
        updateableTextInputField = textInput;
      }
      return textInput;
    });

    let copyAllreadyAssignedAnnotations = [...allreadyAssignedAnnoations];

    if (
      prevAnnotation &&
      copyAllreadyAssignedAnnotations.includes(prevAnnotation)
    ) {
      copyAllreadyAssignedAnnotations = copyAllreadyAssignedAnnotations.filter(
        (annoId) => annoId !== prevAnnotation
      );
    }
    if (!copyAllreadyAssignedAnnotations.includes(annotationId)) {
      copyAllreadyAssignedAnnotations.push(annotationId);
    }
    setAllreadyAssignedAnnoations(copyAllreadyAssignedAnnotations);

    setSubSectionsData(copy);
    if (updateableTextInputField)
      await upsertTextInputFields([updateableTextInputField]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Text Input Fields</DialogTitle>
          <DialogDescription>
            All text input fields for subsection:{" "}
            {subSectionsData[subSectionId].name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="new-text-input-field-dialog-label">
            New Text Input Field
          </Label>
          <div className="flex gap-2">
            <Input
              id="new-text-input-field-dialog-label"
              placeholder="Enter text input field label"
              value={newTextFieldLabel}
              onChange={(e) => setNewTextFieldLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateTextInputField();
                }
              }}
            />
            <Input
              id="new-text-input-field-dialog-placeholder"
              placeholder="Enter text input field placeholder (optional)"
              value={newTextFieldPlaceHolder}
              onChange={(e) => setNewTextFieldPlaceHolder(e.target.value)}
            />

            <Button
              onClick={() => {
                handleCreateTextInputField();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
        <Reorder.Group
          axis="y"
          values={subSectionsData[subSectionId].form_text_input_field}
          onReorder={handleTextInputFieldReorder}
          className="p-2 space-y-3"
        >
          {subSectionsData[subSectionId].form_text_input_field
            .sort(compareTextInputFieldOrderNumbers)
            .map((field) => (
              <Reorder.Item
                key={field.id}
                value={field}
                className="flex items-center justify-between bg-white border p-4 rounded-md shadow cursor-grab"
                dragConstraints={{ top: 0, bottom: 0 }}
              >
                <div className="flex items-center space-x-3">
                  <p className="text-slate-700 font-bold">
                    {field.order_number}.
                  </p>
                  <div className="flex items-center space-x-3">
                    <Input
                      id={`preview-${field.id}`}
                      placeholder={field.placeholder_text}
                      disabled={true}
                    />
                    <Label htmlFor={`preview-${field.id}`}>{field.label}</Label>
                  </div>
                </div>
                <TrainingsSelector
                  field={field}
                  trainingsList={trainingsList}
                  setSubSectionsData={setSubSectionsData}
                  subSectionId={subSectionId}
                ></TrainingsSelector>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={field.id + "annotationSelection"}>ID:</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="border-2 p-1 rounded-xl w-16 h-9">
                      <p className="truncate">
                        {field.annotation_id
                          ? annotations.filter(
                              (annotation) =>
                                annotation.id === field.annotation_id
                            )[0].content
                          : ""}
                      </p>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Available IDs</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <ScrollArea className="h-52">
                        {annotations
                          .filter(
                            (anno) =>
                              !allreadyAssignedAnnoations.includes(anno.id)
                          )
                          .sort(sortAnnotations)
                          .map((annotation) => (
                            <DropdownMenuItem
                              key={annotation.id}
                              onClick={() =>
                                assignAnnotationToTextInputField(
                                  annotation.id,
                                  field.id
                                )
                              }
                            >
                              {annotation.content}
                            </DropdownMenuItem>
                          ))}
                      </ScrollArea>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <TriangleAlert
                    className={`${field.annotation_id && "opacity-0"}`}
                  ></TriangleAlert>
                </div>
                <button onClick={() => handleDeleteTextField(field.id)}>
                  <Trash2 className="text-red-500 cursor-pointer"></Trash2>
                </button>
              </Reorder.Item>
            ))}
        </Reorder.Group>
      </DialogContent>
    </Dialog>
  );
};

interface TrainingsSelectorProps {
  field: IFormTextInputFieldResponse;
  trainingsList: IStringExtractionTrainingResponse[];
  setSubSectionsData: React.Dispatch<
    React.SetStateAction<
      Record<UUID, IInspectableObjectInspectionFormSubSectionWithData>
    >
  >;
  subSectionId: UUID;
}

const TrainingsSelector = ({
  field,
  trainingsList,
  setSubSectionsData,
  subSectionId,
}: TrainingsSelectorProps) => {
  const { showNotification } = useNotification();
  const [selectedTraining, setSelectedTraining] = useState(
    field.training_id ? field.training_id : ""
  );

  const handleUpdateTextInputFieldTraining = async (trainingId: string) => {
    if (isValidUUID(trainingId)) {
      const { updatedFormTextInputField, updatedFormTextInputFieldError } =
        await updateTextInputFieldTraining(field.id, trainingId as UUID);

      if (updatedFormTextInputFieldError) {
        showNotification(
          "Text input field update training id",
          `Error: ${updatedFormTextInputFieldError.message} (${updatedFormTextInputFieldError.code})`,
          "error"
        );
      } else if (updatedFormTextInputField) {
        setSelectedTraining(trainingId);

        setSubSectionsData((subSectionsData) => {
          const copy = { ...subSectionsData };

          copy[subSectionId].form_text_input_field.filter(
            (textInputField) => textInputField.id === field.id
          )[0].training_id = trainingId as UUID;
          return copy;
        });
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={selectedTraining}
        onValueChange={(value) => handleUpdateTextInputFieldTraining(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a training" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Profile</SelectLabel>
            {trainingsList.map((training) => (
              <SelectItem key={training.id} value={training.id}>
                {training.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <TriangleAlert
        className={`${field.training_id && "opacity-0"}`}
      ></TriangleAlert>
    </div>
  );
};
