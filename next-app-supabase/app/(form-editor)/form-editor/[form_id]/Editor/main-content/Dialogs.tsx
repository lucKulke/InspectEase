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
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import {
  createCheckbox,
  createCheckboxTask,
  createTextInputField,
  deleteCheckbox,
  deleteCheckboxTask,
  deleteTextInputField,
  updateCheckboxesOrderNumber,
  updateCheckboxTaskOrder,
  updateTextInputFieldOrder,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

import { Plus, Trash2 } from "lucide-react";
import { Reorder } from "framer-motion";

import { Checkbox } from "@/components/ui/checkbox";

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

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
    return subSectionsData[subSectionId].form_checkbox_group.filter(
      (group) => group.id === currentCheckboxGroupId
    )[0].form_checkbox_task.length;
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
      copy[subSectionId].form_checkbox_group.filter(
        (group) => group.id === currentCheckboxGroupId
      )[0].form_checkbox_task = copy[subSectionId].form_checkbox_group
        .filter((group) => group.id === currentCheckboxGroupId)[0]
        .form_checkbox_task.filter(
          (task) => task.id !== deletedFormCheckboxTask.id
        );
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
        {currentCheckboxGroupId && (
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
}

export const CheckboxGroupDialog = ({
  open,
  setOpen,
  currentCheckboxGroupId,
  subSectionsData,
  setSubSectionsData,
  subSectionId,
}: CheckboxGroupDialogProps) => {
  const { showNotification } = useNotification();

  const [newCheckboxLabel, setNewCheckboxLabel] = useState<string>("");

  const currentCheckboxGroup = () => {
    return subSectionsData[subSectionId].form_checkbox_group.filter(
      (group) => group.id === currentCheckboxGroupId
    )[0].form_checkbox;
  };

  const updateCheckboxOrderInDB = async (
    updatedItems: IFormCheckboxResponse[]
  ) => {
    const { updatedFormCheckboxes, updatedFormCheckboxesError } =
      await updateCheckboxesOrderNumber(updatedItems);

    if (updatedFormCheckboxesError) {
      showNotification(
        "Main section order",
        `Error: ${updatedFormCheckboxesError.message} (${updatedFormCheckboxesError.code})`,
        "error"
      );
    }
  };

  const debouncedCheckboxUpdate = debounce(updateCheckboxOrderInDB, 500);

  const reorderItems = (newOrder: IFormCheckboxResponse[]) => {
    return newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1,
    }));
  };

  const handleCheckboxesReorder = (newOrder: IFormCheckboxResponse[]) => {
    console.log("reorder");
    const updatedItems = reorderItems(newOrder);

    const copy = { ...subSectionsData };
    copy[subSectionId].form_checkbox_group.filter(
      (group) => group.id === currentCheckboxGroupId
    )[0].form_checkbox = newOrder;

    setSubSectionsData(copy);

    debouncedCheckboxUpdate(updatedItems);
  };

  function compareCheckboxOrderNumbers(
    a: IFormCheckboxResponse,
    b: IFormCheckboxResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

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
      order_number: currentCheckboxGroup().length + 1,
      annotation_id: null,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px]">
        {currentCheckboxGroupId && (
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
                Create/Update {currentCheckboxGroup().length}
                checkbox
                {currentCheckboxGroup().length !== 1 ? "es" : ""}
              </DialogDescription>
            </DialogHeader>
            <div>
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
            {currentCheckboxGroup().length === 0 ? (
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
                {currentCheckboxGroup()
                  .sort(compareCheckboxOrderNumbers)
                  .map((checkbox) => (
                    <Reorder.Item
                      key={checkbox.id}
                      value={checkbox}
                      className="flex items-center justify-between bg-white border p-4 rounded-md shadow cursor-grab"
                      dragConstraints={{ top: 0, bottom: 0 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={true}
                          id={`preview-${currentCheckboxGroupId}-${checkbox.id}`}
                        />
                        <Label
                          htmlFor={`preview-${currentCheckboxGroupId}-${checkbox.id}`}
                        >
                          {checkbox.label}
                        </Label>
                      </div>
                      <button onClick={() => handleCheckboxDelete(checkbox.id)}>
                        <Trash2 className="text-red-500 cursor-pointer"></Trash2>
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
}

export const TextInputFieldsDialog = ({
  open,
  setOpen,
  setSubSectionsData,
  subSectionsData,
  subSectionId,
}: TextInputFieldsDialogProps) => {
  const { showNotification } = useNotification();

  const [newTextFieldLabel, setNewTextFieldLabel] = useState<string>("");
  const [newTextFieldPlaceHolder, setNewTextFieldPlaceHolder] =
    useState<string>("");
  const updateTextInputFieldOrderInDB = async (
    updatedItems: IFormTextInputFieldResponse[]
  ) => {
    const { updatedFormTextInputFields, updatedFormTextInputFieldsError } =
      await updateTextInputFieldOrder(updatedItems);

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
    console.log("reorder");
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
      copy[subSectionId].form_text_input_field = reorderItems(
        copy[subSectionId].form_text_input_field.filter(
          (field) => field.id !== deletedFormTextInputField.id
        )
      );

      setSubSectionsData(copy);
    }
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
