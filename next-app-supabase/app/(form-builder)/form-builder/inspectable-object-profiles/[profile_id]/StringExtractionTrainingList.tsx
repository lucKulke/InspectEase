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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createNewStringExtractionTraining } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { UUID } from "crypto";
import { useRouter } from "next/navigation";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";

interface StringExtractionTrainingListProps {
  profileId: UUID;
}

export const StringExtractionTrainingList = ({
  profileId,
}: StringExtractionTrainingListProps) => {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [openCreateNewTrainingDialog, setOpenCreateNewTrainingDialog] =
    useState<boolean>(false);

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

            <ul className="space-y-7 mt-7"></ul>
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
