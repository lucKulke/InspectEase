"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  createNewStringExtractionTraining,
  deleteStringExtractionTraining,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { UUID } from "crypto";
import { useRouter } from "next/navigation";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { IStringExtractionTrainingResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { Ellipsis, Logs, Trash2 } from "lucide-react";
import Link from "next/link";

interface StringExtractionTrainingListProps {
  profileId: UUID;
  trainingList: IStringExtractionTrainingResponse[] | null;
}

export const StringExtractionTrainingList = ({
  profileId,
  trainingList,
}: StringExtractionTrainingListProps) => {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [openCreateNewTrainingDialog, setOpenCreateNewTrainingDialog] =
    useState<boolean>(false);
  const [list, setList] = useState<IStringExtractionTrainingResponse[]>(
    trainingList ? trainingList : []
  );

  const [newTrainingsLabel, setNewTrainingsLabel] = useState<string>("");

  const handleCreateNewTraining = async () => {
    const { stringExtractionTraining, stringExtractionTrainingError } =
      await createNewStringExtractionTraining({
        name: newTrainingsLabel,
        profile_id: profileId,
      });

    if (stringExtractionTrainingError) {
      showNotification(
        "Create new training",
        `Error: ${stringExtractionTrainingError.message} (${stringExtractionTrainingError.code})`,
        "error"
      );
    } else if (stringExtractionTraining) {
      showNotification(
        "Create new training",
        `Successfully create new training with id '${stringExtractionTraining.id}'`,
        "info"
      );
      router.push(
        formBuilderLinks["inspectableObjectProfiles"].href +
          "/" +
          profileId +
          "/string-extraction-training/" +
          stringExtractionTraining.id
      );
    }
  };

  const handleDeleteStringExtractionTraining = async (trainingId: UUID) => {
    console.log("id", trainingId);
    const {
      deletedStringExtractionTraining,
      deletedStringExtractionTrainingError,
    } = await deleteStringExtractionTraining(trainingId);

    if (deletedStringExtractionTrainingError) {
      showNotification(
        "Delete training",
        `Error: ${deletedStringExtractionTrainingError.message} (${deletedStringExtractionTrainingError.code})`,
        "error"
      );
    } else if (deletedStringExtractionTraining) {
      showNotification(
        "Delete training",
        `Successfully deleted training with id '${deletedStringExtractionTraining.id}'`,
        "info"
      );
      setList(list.filter((training) => training.id !== trainingId));
    }
  };

  return (
    <div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Text Extraction Training</CardTitle>
            <CardDescription>
              train ai to extract the correct substrings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">Trainings</p>
              <Button
                onClick={() => {
                  setOpenCreateNewTrainingDialog(true);
                }}
              >
                Create
              </Button>
            </div>

            <ul className="space-y-3 mt-5">
              {list &&
                list.map((training) => (
                  <li
                    className="flex items-center justify-between bg-white border p-4 rounded-md shadow cursor-point"
                    key={training.id}
                  >
                    <p>{training.name}</p>

                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger>
                        <Ellipsis className="text-slate-500 "></Ellipsis>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link
                            href={
                              formBuilderLinks["inspectableObjectProfiles"]
                                .href +
                              "/" +
                              profileId +
                              "/string-extraction-training/" +
                              training.id
                            }
                          >
                            view
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            handleDeleteStringExtractionTraining(training.id)
                          }
                        >
                          delete <Trash2></Trash2>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>

        <Dialog
          open={openCreateNewTrainingDialog}
          onOpenChange={setOpenCreateNewTrainingDialog}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create new from type</DialogTitle>
              <DialogDescription>Add a new form type</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newTrainingLabel" className="text-right">
                  Name
                </Label>
                <Input
                  id="newTrainingLabel"
                  value={newTrainingsLabel} // Controlled input
                  onChange={(e) => setNewTrainingsLabel(e.target.value)} // Update state on input change
                  className="col-span-3"
                />
              </div>
            </div>

            <DialogFooter>
              {newTrainingsLabel.length > 3 ? (
                <Button onClick={() => handleCreateNewTraining()}>
                  Create
                </Button>
              ) : (
                <Button disabled variant="outline">
                  Create
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
