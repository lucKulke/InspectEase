"use client";

import {
  IInspectableObjectProfileFormTypePropertyInsert,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileWitFormTypes,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";

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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

import { UploadDocument } from "./UploadDocument";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchProfileFormTypeProps } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

interface NewInspectionFormCardProps {
  objectId: UUID;
  profileWithFormTypes: IInspectableObjectProfileWitFormTypes;
}

export const NewInspectionFormCard = ({
  objectId,
  profileWithFormTypes,
}: NewInspectionFormCardProps) => {
  const { showNotification } = useNotification();

  const [formTypeProps, setFormTypeProps] = useState<
    IInspectableObjectProfileFormTypePropertyResponse[]
  >([]);
  const [selectedFormTypeId, setSelectedFormTypeId] = useState<UUID>();
  const [resetSelectComponent, setResetSelectComponent] = useState(+new Date());
  const [formTypeValues, setFormTypeValues] = useState<Record<UUID, string>>();
  const [isFilled, setIsFilled] = useState<boolean>(false);

  const [file, setFile] = useState<File | null>(null);

  const fetchFormTypeProps = async (formTypeId: UUID) => {
    const {
      inspectableObjectProfileFormTypeProps,
      inspectableObjectProfileFormTypePropsError,
    } = await fetchProfileFormTypeProps(formTypeId);
    if (inspectableObjectProfileFormTypePropsError) {
      showNotification(
        "Fetch form type props",
        `Error: ${inspectableObjectProfileFormTypeProps} (${inspectableObjectProfileFormTypePropsError.code})`,
        "error"
      );
      setResetSelectComponent(+new Date());
      return;
    }
    if (inspectableObjectProfileFormTypeProps)
      setFormTypeProps(inspectableObjectProfileFormTypeProps);
  };

  useEffect(() => {
    if (selectedFormTypeId) {
      fetchFormTypeProps(selectedFormTypeId);
    }
  }, [selectedFormTypeId]);

  const handleInputChange = (propertyId: string, value: string) => {
    setFormTypeValues((prev) => ({ ...prev, [propertyId]: value }));
  };

  const handleCreateInspectionForm = () => {
    console.log("plan", formTypeValues);
    console.log("file", file?.name);
  };

  function compare(
    a: IInspectableObjectProfileFormTypePropertyResponse,
    b: IInspectableObjectProfileFormTypePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }
  return (
    <Card className="w-1/2">
      <CardHeader>
        <CardTitle>New inspection form</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          key={resetSelectComponent}
          onValueChange={(value) => setSelectedFormTypeId(value as UUID)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a form type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {profileWithFormTypes.inspectable_object_profile_form_type.map(
                (type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                )
              )}
            </SelectGroup>
          </SelectContent>
        </Select>

        <ul className="space-y-2 mt-5">
          {formTypeProps.sort(compare).map((typeProp) => (
            <li key={typeProp.id}>
              <Label>
                {typeProp.name}
                <Input
                  id={typeProp.created_at.toString()}
                  onChange={(e) =>
                    handleInputChange(typeProp.id, e.target.value)
                  }
                ></Input>
              </Label>
              <p className="text-sm text-slate-500">{typeProp.description}</p>
            </li>
          ))}
        </ul>

        {selectedFormTypeId && (
          <UploadDocument file={file} setFile={setFile}></UploadDocument>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {isFilled ? (
          <Button onClick={() => handleCreateInspectionForm()}>Create</Button>
        ) : (
          <Button variant="outline">Create</Button>
        )}
      </CardFooter>
    </Card>
  );
};
