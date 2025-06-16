"use client";

import {
  IInspectableObjectInspectionFormInsert,
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
import {
  createInspectionForm,
  extractAnnotationsFromPDF,
  fetchProfileFormTypeProps,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { AnnotationData, AnnotationsApiResponse } from "@/lib/globalInterfaces";
import { Progress } from "@/components/ui/progress";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { Spinner } from "@/components/Spinner";

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

  const [resetSelectComponent, setResetSelectComponent] = useState(+new Date());
  const [formTypeValues, setFormTypeValues] = useState<Record<UUID, string>>();
  const [isFilled, setIsFilled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [file, setFile] = useState<File | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl ?? "");
  const [selectedFormTypeId, setSelectedFormTypeId] = useState<UUID>(
    tabFromUrl as UUID
  );

  // Handle syncing with URL
  useEffect(() => {
    if (tabFromUrl !== activeTab) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("tab", activeTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [activeTab]);

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
      setActiveTab(selectedFormTypeId);
      fetchFormTypeProps(selectedFormTypeId);
    }
  }, [selectedFormTypeId]);

  // only for checking if form is filled.. not realy elegant

  useEffect(() => {
    checkIsFilled();
  }, [formTypeValues]);

  useEffect(() => {
    if (file) {
      checkIsFilled();
    } else {
      setIsFilled(false);
    }
  }, [file]);

  const checkIsFilled = (): boolean => {
    if (!formTypeValues) return false;
    if (Object.entries(formTypeValues).length === formTypeProps.length) {
      let tempIsFilled = true;
      Object.entries(formTypeValues).forEach(([key, value]) => {
        if (value.length < 1) {
          setIsFilled(false);
          tempIsFilled = false;
          return;
        }
      });
      if (file && tempIsFilled) {
        setIsFilled(true);
        return true;
      }
    }
    return false;
  };
  // ------------------------------

  const handleInputChange = (propertyId: string, value: string) => {
    setFormTypeValues((prev) => ({ ...prev, [propertyId]: value }));
  };

  function hasDuplicateAnnotations(annotations: AnnotationData[]): boolean {
    const seenContents: Set<string> = new Set();

    for (const annotation of annotations) {
      if (seenContents.has(annotation.contents)) {
        // If the contents have been seen before, it's a duplicate
        return true;
      }
      seenContents.add(annotation.contents);
    }

    // No duplicates found
    return false;
  }

  const handleCreateInspectionForm = async () => {
    if (!file || !selectedFormTypeId || !formTypeValues) return;

    const annotationsData = await extractAnnotationsFromPDF(file);

    if (hasDuplicateAnnotations(annotationsData)) {
      showNotification(
        "Extract pdf annotations",
        "Error: Duplicate annotations found",
        "error"
      );
      setLoading(false);
      return;
    }

    const { inspectionForm, inspectionFormError } = await createInspectionForm(
      selectedFormTypeId,
      objectId,
      formTypeValues,
      file,
      annotationsData
    );

    if (inspectionFormError) {
      showNotification(
        "Create inspection form",
        `Error: ${inspectionFormError.message} (${inspectionFormError.message})`,
        "error"
      );
      setLoading(false);
      return;
    }

    showNotification(
      "Create inspection form",
      `Successfully created inspection form with id '${inspectionForm.id}'`,
      "info"
    );
    setLoading(false);
    redirect(
      formBuilderLinks["inspectableObjects"].href +
        "/" +
        objectId +
        "?tab=" +
        selectedFormTypeId
    );
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
          value={activeTab}
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
        {loading ? (
          <Spinner />
        ) : (
          <>
            {isFilled ? (
              <Button
                onClick={() => {
                  setLoading(true);
                  handleCreateInspectionForm();
                }}
              >
                Create
              </Button>
            ) : (
              <Button variant="outline">Create</Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};
