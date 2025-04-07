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

interface InspectionFormSelectorProps {
  profiles: IInspectableObjectProfileResponse[];
  profileProps: IInspectableObjectProfileObjPropertyResponse[];
  objects: IInspectableObjectWithPropertiesResponse[];
  inspectionForms: IInspectableObjectInspectionFormWithProps[];
  profileFormTypes: IInspectableObjectProfileFormTypeWithProps[];
}

export const InspectionFormSelector = ({
  profiles,
  profileProps,
  objects,
  inspectionForms,
  profileFormTypes,
}: InspectionFormSelectorProps) => {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedObject, setSelectedObject] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [activeTab, setActiveTab] = useState("select-group");

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

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
  };

  const handleContinueToForm = () => {
    if (selectedObject && selectedPlan) {
      setActiveTab("fill-form");
    } else {
      //   toast({
      //     title: "Selection required",
      //     description: "Please select an inspection plan",
      //     variant: "destructive",
      //   });
    }
  };

  const handleSubmit = (formData: any) => {
    // Here you would submit the form data to your backend
    console.log("Submitting inspection data:", {
      groupId: selectedGroup,
      objectId: selectedObject,
      planId: selectedPlan,
      formData,
    });

    // toast({
    //   title: "Inspection submitted",
    //   description: "Your inspection has been successfully recorded",
    // });

    // Reset the form
    setSelectedGroup("");
    setSelectedObject("");
    setSelectedPlan("");
    setActiveTab("select-group");

    // Optionally redirect to a confirmation page
    // router.push('/inspection-form/confirmation')
  };

  const handleBack = (step: string) => {
    setActiveTab(step);
  };

  const handleInspectionFormSelect = (formId: UUID) => {
    createFillableInspectionForm();
  };

  function compareProfileProps(
    a: IInspectableObjectProfileObjPropertyResponse,
    b: IInspectableObjectProfileObjPropertyResponse
  ) {
    if (a.order_number > b.order_number) return 1;
    if (a.order_number < b.order_number) return -1;
    return 0;
  }
  function compareFormTypeProps(
    a: IInspectableObjectProfileFormTypePropertyResponse,
    b: IInspectableObjectProfileFormTypePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <div className="p-4">
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
        <TabsContent value="select-group">
          <Card>
            <CardHeader>
              <CardTitle>Select Object Group</CardTitle>
              <CardDescription>
                Choose the type of objects you want to inspect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => selectedGroup && setActiveTab("select-object")}
                disabled={!selectedGroup}
                className="ml-auto"
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Step 2: Select Object from Table */}
        <TabsContent value="select-object">
          <Card>
            <CardHeader>
              <CardTitle>Select Object</CardTitle>
              <CardDescription>Choose an object from the group</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {profileProps
                      .filter(
                        (profileProp) =>
                          profileProp.profile_id === selectedGroup
                      )
                      .sort(compareProfileProps)
                      .map((profileProp) => (
                        <TableCell key={profileProp.id} className="font-bold">
                          {profileProp.name}
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {objects
                    .filter((object) => object.profile_id === selectedGroup)
                    .map((object) => {
                      return (
                        <TableRow
                          key={object.id}
                          className={
                            selectedObject === object.id
                              ? "bg-muted"
                              : "cursor-pointer hover:bg-muted/50"
                          }
                          onClick={() => handleObjectSelect(object.id)}
                        >
                          {profileProps
                            .filter(
                              (profileProp) =>
                                profileProp.profile_id === selectedGroup
                            )
                            .sort(compareProfileProps)
                            .map((profileProp) => {
                              const objProp =
                                object.inspectable_object_property.filter(
                                  (objProp) =>
                                    objProp.profile_property_id ===
                                    profileProp.id
                                )[0];

                              return objProp ? (
                                <TableCell key={objProp.id}>
                                  {objProp.value}
                                </TableCell>
                              ) : (
                                <TableCell key={uuidv4()}></TableCell>
                              );
                            })}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleBack("select-group")}
              >
                Back
              </Button>
              <Button
                onClick={() => selectedObject && setActiveTab("select-plan")}
                disabled={!selectedObject}
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Step 3: Select Inspection Plan */}
        <TabsContent value="select-plan">
          <Card>
            <CardHeader>
              <CardTitle>Select Inspection Plan</CardTitle>
              <CardDescription>Choose an inspection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {profileFormTypes
                  .filter(
                    (profileFormType) =>
                      profileFormType.profile_id === selectedGroup
                  )
                  .map((formType) => (
                    <li key={formType.id}>
                      <h2>{formType.name}</h2>
                      <ScrollArea className="border-2 border-black rounded-lg p-4">
                        <Table>
                          <TableCaption>
                            All "{formType.name}" inspection plans for object
                          </TableCaption>
                          <TableHeader>
                            <TableRow>
                              {formType.inspectable_object_profile_form_type_property
                                .sort(compareFormTypeProps)
                                .map((formTypeProp) => (
                                  <TableCell key={formTypeProp.id}>
                                    <p className="font-bold">
                                      {formTypeProp.name}
                                    </p>
                                  </TableCell>
                                ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {inspectionForms
                              .filter(
                                (inspectionForm) =>
                                  inspectionForm.form_type_id === formType.id
                              )
                              .map((inspectionForm) => (
                                <TableRow
                                  key={inspectionForm.id}
                                  onClick={() => handleInspectionFormSelect()}
                                >
                                  {formType.inspectable_object_profile_form_type_property
                                    .sort(compareFormTypeProps)
                                    .map((type) => {
                                      const form =
                                        inspectionForm.inspectable_object_inspection_form_property.filter(
                                          (inspectionForm) =>
                                            inspectionForm.form_type_prop_id ===
                                            type.id
                                        )[0];

                                      return form ? (
                                        <TableCell key={form.id}>
                                          {form?.value}
                                        </TableCell>
                                      ) : (
                                        <TableCell key={uuidv4()}></TableCell>
                                      );
                                    })}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </li>
                  ))}
              </ul>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleBack("select-object")}
              >
                Back
              </Button>
              <Button onClick={handleContinueToForm} disabled={!selectedPlan}>
                Continue to Form <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
