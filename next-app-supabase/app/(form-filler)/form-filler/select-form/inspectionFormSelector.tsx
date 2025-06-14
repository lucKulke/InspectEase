"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Check, ChevronRight, Cog } from "lucide-react";
import {
  IInspectableObjectInspectionFormWithProps,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeWithProps,
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectWithPropertiesResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { v4 as uuidv4 } from "uuid";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { UUID } from "crypto";
import { createFillableInspectionForm } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { SupabaseError } from "@/lib/globalInterfaces";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/Spinner";
import { SelectObject } from "./SelectObject";
import { SelectFormTypes } from "./SelectFormTypes";

interface InspectionFormSelectorProps {
  profiles: IInspectableObjectProfileResponse[];
  profileProps: IInspectableObjectProfileObjPropertyResponse[];
  objectsWithProps: IInspectableObjectWithPropertiesResponse[];
  inspectionForms: IInspectableObjectInspectionFormWithProps[];
  profileFormTypes: IInspectableObjectProfileFormTypeWithProps[];
}

export const InspectionFormSelector = ({
  profiles,
  profileProps,
  objectsWithProps,
  inspectionForms,
  profileFormTypes,
}: InspectionFormSelectorProps) => {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedObject, setSelectedObject] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [activeTab, setActiveTab] = useState<string>("select-group");
  const [formIdentifierString, setFormIdentifierString] = useState<string>("");
  const [formIdentifierStringError, setFormIdentifierStringError] = useState<
    string | null
  >(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    setSelectedObject("");
    setSelectedPlan("");
    setActiveTab("select-object");
  };

  const handleObjectSelect = (objectId: string) => {
    setSelectedObject(objectId);
    setSelectedPlan("");
    setActiveTab("select-plan");
  };

  const handleContinueToForm = async () => {
    const { id, error } = await createFillableInspectionForm({
      build_id: selectedPlan as UUID,
      identifier_string: formIdentifierString,
    });

    if (error) {
      showNotification("Create text input fields", `Error`, "error");
      console.log("form id", id);
      setIsSubmitting(false);
    } else if (id) {
      router.push("/form/" + id);
    }
  };

  const handleCreateNewFillableForm = (e: React.FormEvent) => {
    setIsSubmitting(true);
    e.preventDefault();
    const identifier = formIdentifierString.trim();
    if (!identifier.trim()) {
      setFormIdentifierStringError("Identifier string is required");
      setIsSubmitting(false);
      return;
    }

    handleContinueToForm();
  };

  const handleBack = (step: string) => {
    setActiveTab(step);
  };

  const handleSelectFormType = (formTypeId: string) => {
    setSelectedPlan(formTypeId);
    setOpenDialog(true);
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="select-group">Select Group</TabsTrigger>
          <TabsTrigger value="select-object" disabled={!selectedGroup}>
            Select Object
          </TabsTrigger>
          <TabsTrigger value="select-plan" disabled={!selectedObject}>
            Select Plan
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Select Object Group */}
        <TabsContent value="select-group" className="p-2">
          <div className="space-y-2">
            <label htmlFor="group-select" className="text-sm font-medium">
              Object Group
            </label>
            <Select value={selectedGroup} onValueChange={handleGroupChange}>
              <SelectTrigger id="group-select">
                <SelectValue placeholder="Select an object group" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Step 2: Select Object from Table */}
        <TabsContent value="select-object" className="p-2">
          <SelectObject
            profileProps={profileProps}
            selectedGroup={selectedGroup}
            objectsWithProps={objectsWithProps}
            handleObjectSelect={handleObjectSelect}
          ></SelectObject>
        </TabsContent>

        {/* Step 3: Select Inspection Plan */}
        <TabsContent value="select-plan" className="p-2">
          <SelectFormTypes
            inspectionFormsWithProps={inspectionForms}
            profileFormTypes={profileFormTypes}
            selectedGroup={selectedGroup}
            selectedObject={selectedObject}
            handleSelect={handleSelectFormType}
          />

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateNewFillableForm}>
                <DialogHeader>
                  <DialogTitle>Create New Inspection Form</DialogTitle>
                  <DialogDescription>
                    Enter a identifier string for the new inspection form.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="identifierString"
                      className="flex items-center justify-between"
                    >
                      Identifier string
                      <span className="text-xs text-muted-foreground">
                        (Required)
                      </span>
                    </Label>
                    <Input
                      id="identifierString"
                      value={formIdentifierString}
                      onChange={(e) => {
                        setFormIdentifierString(e.target.value);
                        if (formIdentifierStringError)
                          setFormIdentifierStringError(null);
                      }}
                      placeholder="e.g., REF-2023-001"
                      className={
                        formIdentifierStringError ? "border-red-500" : ""
                      }
                      autoFocus
                    />
                    {formIdentifierStringError && (
                      <p className="text-sm text-red-500">
                        {formIdentifierStringError}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  {isSubmitting ? (
                    <Button variant={"outline"} className="w-20">
                      <Spinner></Spinner>
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setOpenDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Form</Button>
                    </>
                  )}
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </>
  );
};
