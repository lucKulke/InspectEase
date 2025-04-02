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
export const TextInputFieldTrainingList = () => {
  const [openCreateNewTrainingDialog, setOpenCreateNewTrainingDialog] =
    useState<boolean>(false);

  const [newTrainingsLabel, setNewTrainingsLabel] = useState<string>("");

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
              <p className="text-sm text-slate-600">Types</p>
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
              <Button disabled variant="outline">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
