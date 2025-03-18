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
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { createCheckboxTask } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

interface CreateTaskDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentCheckboxGroup: IFormCheckboxGroupWithCheckboxes | null;
}

export const CreateTaskDialog = ({
  open,
  setOpen,
  currentCheckboxGroup,
}: CreateTaskDialogProps) => {
  if (!currentCheckboxGroup) {
    return <div>Error</div>;
  }

  const { showNotification } = useNotification();
  const [taskList, setTaskList] = useState<IFormCheckboxTaskResponse[]>(
    currentCheckboxGroup.form_checkbox_task
  );

  const [newTaskDescription, setNewTaskDescription] = useState<string>("");

  const handleCreateTask = async () => {
    const newTask: IFormCheckboxTaskInsert = {
      description: newTaskDescription,
      group_id: currentCheckboxGroup.id,
      order_number: taskList.length + 1,
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
      setTaskList([...taskList, formCheckboxTask]);
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
          <Label htmlFor={`task-dialog-${currentCheckboxGroup.id}`}>
            New Task
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id={`task-dialog-${currentCheckboxGroup.id}`}
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            <Button onClick={() => handleCreateTask()}>Create</Button>
          </div>
        </div>

        {taskList.length < 1 ? (
          <div className="border-2 rounded-xl min-h-11 flex items-center justify-center">
            <p className="text-sm text-slate-500">No task created yet</p>
          </div>
        ) : (
          <ul className="border-2 rounded-xl">
            {taskList.map((task) => (
              <li key={task.id}>-{task.description}</li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};
