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
  IFormCheckboxTaskInsert,
  IFormCheckboxTaskResponse,
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { createCheckboxTask } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { group } from "console";

interface CreateTaskDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentCheckboxGroupId: UUID;
  sectionData: IInspectableObjectInspectionFormSubSectionWithData;
  setSectionData: React.Dispatch<
    React.SetStateAction<IInspectableObjectInspectionFormSubSectionWithData>
  >;
}

export const CreateTaskDialog = ({
  open,
  setOpen,
  currentCheckboxGroupId,
  sectionData,
  setSectionData,
}: CreateTaskDialogProps) => {
  const { showNotification } = useNotification();

  const [newTaskDescription, setNewTaskDescription] = useState<string>("");

  const currentTaskListLenght = () => {
    return sectionData.form_checkbox_group.filter(
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
    }

    if (formCheckboxTask) {
      const copyOfSectionData = { ...sectionData };
      copyOfSectionData.form_checkbox_group
        .filter((group) => group.id === currentCheckboxGroupId)[0]
        .form_checkbox_task.push(formCheckboxTask);
      setSectionData(copyOfSectionData);
    }
  };

  const handleDeleteTask = () => {};
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Manage Checkboxe Tasks</DialogTitle>
          <DialogDescription>
            Create tasks that needs to be fullfilled to finish sub section.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor={`task-dialog-${currentCheckboxGroupId}`}>
            New Task
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id={`task-dialog-${currentCheckboxGroupId}`}
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            <Button onClick={() => handleCreateTask()}>Create</Button>
          </div>
        </div>

        {currentTaskListLenght() < 1 ? (
          <div className="border-2 rounded-xl min-h-11 flex items-center justify-center">
            <p className="text-sm text-slate-500">No task created yet</p>
          </div>
        ) : (
          <ul className="border-2 rounded-xl">
            {sectionData.form_checkbox_group
              .filter((group) => group.id === currentCheckboxGroupId)[0]
              .form_checkbox_task.map((task) => (
                <li key={task.id}>-{task.description}</li>
              ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};
