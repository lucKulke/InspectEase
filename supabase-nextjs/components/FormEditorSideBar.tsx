"use client";
import React, { useState } from "react";
import { SectionName } from "@/lib/interfaces";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormEditorSideBarProps {
  sectionNames: SectionName[];
}

const FormEditorSideBar = ({ sectionNames }: FormEditorSideBarProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Pedro Duarte");
  const handleAddSection = () => {
    console.log("name", name);
    setOpen(false); // Close the dialog
  };
  return (
    <div className="border-2 rounded-xl m-3 p-2 w-1/4">
      <ul className="space-y-6">
        {sectionNames.map((sectionName) => (
          <li key={sectionName.id}>
            <h2 className="text-sm text-slate-500">{sectionName.name}</h2>
            <ul className="space-y-2">
              {sectionName.groupNames.map((groupName) => (
                <li key={groupName.id} className="ml-2">
                  - {groupName.name}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add section</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add new section</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name} // Controlled input
                onChange={(e) => setName(e.target.value)} // Update state on input change
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddSection}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormEditorSideBar;
