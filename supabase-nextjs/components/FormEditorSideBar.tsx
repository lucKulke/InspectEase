"use client";
import React, { useEffect, useState } from "react";
import { MainSection, SubSection } from "@/lib/interfaces";

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
import { Plus, Dot, Trash2, Ellipsis } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FormEditorSideBarProps {
  mainSections: MainSection[];
  subSections: SubSection[];
  createMainSection: (sectionName: string) => void;
  createSubSection: (sectionName: string, mainSectionId: string) => void;
  deleteSubSection: (subSectionId: string) => void;
  deleteMainSection: (mainSectionId: string) => void;
}

const FormEditorSideBar = ({
  mainSections,
  subSections,
  createMainSection,
  createSubSection,
  deleteSubSection,
  deleteMainSection,
}: FormEditorSideBarProps) => {
  const [openAddMainSection, setOpenAddMainSection] = useState(false);
  const [openAddSubSection, setOpenAddSubSection] = useState(false);
  const [mainSectionName, setMainSectionName] = useState("");
  const [subSectionName, setSubSectionName] = useState("");
  const [mainSectionId, setMainSectionId] = useState<string | null>(null);

  const handleAddMainSection = () => {
    console.log("main section name", mainSectionName);
    createMainSection(mainSectionName);

    setOpenAddMainSection(false);
  };

  const handleAddSubSection = () => {
    console.log("sub section name", subSectionName);
    if (mainSectionId) {
      createSubSection(subSectionName, mainSectionId);
      setOpenAddSubSection(false);

      setMainSectionId(null);
    }
  };

  const handleDeleteMainSection = (mainSectionId: string) => {
    deleteMainSection(mainSectionId);
  };

  const handleDeleteSubSection = (subSectionId: string) => {
    deleteSubSection(subSectionId);
  };

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const topOffset = 100; // Adjust this value for how far from the top you want the section
      const sectionPosition =
        section.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = sectionPosition - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="border-2 rounded-xl m-3 p-2 w-1/4">
      <ul className="space-y-6">
        {mainSections.map((mainSection) => (
          <li key={mainSection.id}>
            <div className="flex items-center space-x-3 group ">
              <button onClick={() => scrollToSection(mainSection.id)}>
                <h2 className="text-sm text-slate-500">{mainSection.name}</h2>
              </button>

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                  <Ellipsis className="text-slate-500  opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-200"></Ellipsis>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      setOpenAddSubSection(true);
                      setMainSectionId(mainSection.id);
                    }}
                  >
                    Add sub section
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={() => handleDeleteMainSection(mainSection.id)}
                  >
                    delete <Trash2></Trash2>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <ul className="space-y-4 mt-2">
              {subSections
                .filter((subSection) => {
                  return subSection.main_section_id === mainSection.id;
                })
                .map((subSection) => (
                  <li key={subSection.id} className="ml-2   flex group">
                    <button onClick={() => scrollToSection(subSection.id)}>
                      <div className="flex">
                        <h3 className="mr-2">-</h3>
                        <h3 className="mr-2">{subSection.name}</h3>
                      </div>
                    </button>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger>
                        <Ellipsis className="text-slate-500 opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-200"></Ellipsis>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => handleDeleteSubSection(subSection.id)}
                        >
                          delete <Trash2></Trash2>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>

      <Dialog open={openAddSubSection} onOpenChange={setOpenAddSubSection}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add new sub section</DialogTitle>
            <DialogDescription>add new sub section</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subSectionName" className="text-right">
                Name
              </Label>
              <Input
                id="subSectionName"
                value={subSectionName} // Controlled input
                onChange={(e) => setSubSectionName(e.target.value)} // Update state on input change
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            {subSectionName.length > 3 ? (
              <Button onClick={handleAddSubSection}>Save changes</Button>
            ) : (
              <Button disabled variant="outline">
                Save changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-8">
        <Dialog open={openAddMainSection} onOpenChange={setOpenAddMainSection}>
          <DialogTrigger asChild>
            <Button variant="outline">Add section</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add new main section</DialogTitle>
              <DialogDescription>
                Add a new main section to structure the document.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mainSectionName" className="text-right">
                  Name
                </Label>
                <Input
                  id="mainSectionName"
                  value={mainSectionName} // Controlled input
                  onChange={(e) => setMainSectionName(e.target.value)} // Update state on input change
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              {mainSectionName.length > 3 ? (
                <Button onClick={handleAddMainSection}>Save changes</Button>
              ) : (
                <Button disabled variant="outline">
                  Save changes
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FormEditorSideBar;
