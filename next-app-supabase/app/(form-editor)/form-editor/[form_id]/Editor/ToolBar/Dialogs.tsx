import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionInsert,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreateMainSectionDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  create: (name: string, description: string) => Promise<void>;
}

export const CreateMainSectionDialog = ({
  open,
  setOpen,
  create,
}: CreateMainSectionDialogProps) => {
  const [newMainSectionName, setNewMainSectionName] = useState<string>("");
  const [newMainSectionDescription, setNewMainSectionDescription] =
    useState<string>("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create</DialogTitle>
          <DialogDescription>Create new main section</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="createMainSectionName">Name</Label>
            <Input
              id="createMainSectionName"
              value={newMainSectionName} // Controlled input
              onChange={(e) => setNewMainSectionName(e.target.value)} // Update state on input change
              className="col-span-3"
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
                create(newMainSectionName, newMainSectionDescription);
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
  );
};

interface CreateSubSectionDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  create: (
    newSubSection: IInspectableObjectInspectionFormSubSectionInsert
  ) => Promise<void>;
  sideBarData: IInspectableObjectInspectionFormMainSectionWithSubSection[];
}

export const CreateSubSectionDialog = ({
  open,
  setOpen,
  create,
  sideBarData,
}: CreateSubSectionDialogProps) => {
  const [mainSectionId, setMainSectionId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Sub Section</DialogTitle>
          <DialogDescription>
            Add a new sub section to an existing main section.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="main-section">Main Section</Label>
            <Select value={mainSectionId} onValueChange={setMainSectionId}>
              <SelectTrigger id="main-section">
                <SelectValue placeholder="Select a main section" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {sideBarData.map((mainSection) => (
                  <SelectItem key={mainSection.id} value={mainSection.id}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>{mainSection.name}</TooltipTrigger>
                        <TooltipContent>
                          <p>{mainSection.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter sub section name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter sub section description (optional)"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
