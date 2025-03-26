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
import { UUID } from "crypto";
import { CheckboxManager } from "./CheckboxManager";

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
              onKeyDown={(e) => {
                if (e.key === "Enter" && newMainSectionName.length > 0)
                  create(newMainSectionName, newMainSectionDescription);
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
  sections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
}

export const CreateSubSectionDialog = ({
  open,
  setOpen,
  create,
  sections,
}: CreateSubSectionDialogProps) => {
  const [mainSectionId, setMainSectionId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleCreateSubSection = () => {
    let subSectionOrderNumber = 0;
    sections.forEach((mainSubSection) => {
      if (mainSubSection.id === mainSectionId) {
        subSectionOrderNumber =
          mainSubSection.inspectable_object_inspection_form_sub_section.length +
          1;
        return;
      }
    });
    create({
      name: name,
      description: description,
      main_section_id: mainSectionId as UUID,
      order_number: subSectionOrderNumber,
    });
  };

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
                {sections.map((mainSection) => (
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
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  mainSectionId.length > 0 &&
                  name.length > 3
                )
                  handleCreateSubSection();
              }}
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
        <DialogFooter>
          {mainSectionId.length > 0 && name.length > 3 ? (
            <Button
              onClick={() => {
                handleCreateSubSection();
              }}
            >
              Create
            </Button>
          ) : (
            <Button variant="outline">Create</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CreateCheckboxDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
  refetchSubSectionsData: () => Promise<void>;
}

export const CreateCheckboxDialog = ({
  open,
  setOpen,
  sections,
  refetchSubSectionsData,
}: CreateCheckboxDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Manage Checkboxes</DialogTitle>
          <DialogDescription>
            Create checkboxes and organize them into selection groups.
          </DialogDescription>
        </DialogHeader>
        <CheckboxManager
          sections={sections}
          setOpen={setOpen}
          refetchSubSectionsData={refetchSubSectionsData}
        ></CheckboxManager>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
