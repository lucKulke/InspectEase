import React, { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  IFormTextInputFieldInsert,
  IFormTextInputFieldResponse,
  IInspectableObjectInspectionFormMainSectionWithSubSection,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { UUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { createFormTextInputField } from "../actions";
import { useNotification } from "@/app/context/NotificationContext";

interface ITextInputField {
  id: UUID;
  label: string;
  placeHolder: string;
}

interface TextFieldManagerProps {
  sections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetchSubSectionsData: () => Promise<void>;
}

export const TextFieldManager = ({
  sections,
  setOpen,
  refetchSubSectionsData,
}: TextFieldManagerProps) => {
  const { showNotification } = useNotification();

  const [newTextFieldLabel, setNewTextFieldLabel] = useState<string>("");
  const [newTextFieldPlaceHolder, setNewTextFieldPlaceHolder] =
    useState<string>("");
  const [assignedSubSections, setAssignedSubSections] = useState<
    Record<string, string[]>
  >({});

  const [textFieldList, setTextFieldList] = useState<ITextInputField[]>([]);
  const [selectedField, setSelectedField] = useState<string>("");

  const handleCreateTextInputField = () => {
    const newTextInputField: ITextInputField = {
      id: uuidv4() as UUID,
      label: newTextFieldLabel,
      placeHolder: newTextFieldPlaceHolder,
    };

    setTextFieldList([...textFieldList, newTextInputField]);
    setNewTextFieldLabel("");
    setNewTextFieldPlaceHolder("");
  };

  const handleDeleteTextInputField = (textInputFieldId: UUID) => {
    setTextFieldList((prev) => {
      return prev.filter((field) => field.id !== textInputFieldId);
    });
  };

  const handleCreateTextInputFieldsInDB = async () => {
    const fields: IFormTextInputFieldInsert[] = [];
    for (const subSectionId in assignedSubSections) {
      assignedSubSections[subSectionId].forEach((fieldId) => {
        const field = textFieldList.filter((field) => field.id === fieldId)[0];
        fields.push({
          sub_section_id: subSectionId as UUID,
          label: field.label,
          placeholder_text: field.placeHolder,
          order_number: 0,
          annotation_id: null,
        });
      });
    }

    const { formTextInputFields, formTextInputFieldsError } =
      await createFormTextInputField(fields);

    if (formTextInputFieldsError) {
      showNotification(
        "Create text input fields",
        `Error: ${formTextInputFieldsError.message} (${formTextInputFieldsError.code})`,
        "error"
      );
    } else if (formTextInputFields) {
      showNotification(
        "Create text input fields",
        `Successfully created ${formTextInputFields.length} text input field${
          formTextInputFields.length > 1 && "s"
        }`,
        "info"
      );
    }

    refetchSubSectionsData();
    setOpen(false);
  };

  const assignToSubSection = (subSectionId: UUID) => {
    const copy = { ...assignedSubSections };
    if (copy[subSectionId]) {
      if (copy[subSectionId].includes(selectedField)) {
        copy[subSectionId] = copy[subSectionId].filter(
          (field) => field !== selectedField
        );
      } else {
        copy[subSectionId] = [...copy[subSectionId], selectedField];
      }
      if (copy[subSectionId].length === 0) {
        delete copy[subSectionId];
      }
    } else {
      copy[subSectionId] = [selectedField];
    }
    console.log("assinged", copy);
    setAssignedSubSections(copy);
  };

  return (
    <div>
      <Tabs defaultValue="create" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create</TabsTrigger>

          <TabsTrigger value="assign">Assign</TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-text-input-field-label">
                New Text Input Field
              </Label>
              <div className="flex gap-2">
                <Input
                  id="new-text-input-field-label"
                  placeholder="Enter text input field label"
                  value={newTextFieldLabel}
                  onChange={(e) => setNewTextFieldLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateTextInputField();
                    }
                  }}
                />
                <Input
                  id="new-text-input-field-label"
                  placeholder="Enter text input field placeholder (optional)"
                  value={newTextFieldPlaceHolder}
                  onChange={(e) => setNewTextFieldPlaceHolder(e.target.value)}
                />

                <Button onClick={handleCreateTextInputField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">
                Created Text Input Fields
              </h3>
              <ScrollArea className="h-[200px] rounded-md border p-2 ">
                {textFieldList.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    No text input fields created yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {textFieldList.map((textInputField, index) => (
                      <div key={textInputField.id} className="space-y-2">
                        {index !== 0 && <Separator />}
                        <div
                          key={textInputField.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center w-3/4 space-x-2">
                            <Input
                              className="w-1/3"
                              disabled={true}
                              id={textInputField.id + "fake-input"}
                              placeholder={textInputField.placeHolder}
                            ></Input>
                            <Label
                              className="truncate w-2/3"
                              htmlFor={textInputField.id + "fake-input"}
                            >
                              {textInputField.label}
                            </Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteTextInputField(textInputField.id)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="assign">
          <div className="flex space-x-4">
            <ScrollArea className="h-[260px] w-1/2 rounded-md border p-2 ">
              {textFieldList.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">
                  No text input fields created yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {textFieldList.map((textInputField, index) => (
                    <div key={textInputField.id} className="space-y-2">
                      {index !== 0 && <Separator />}
                      <div
                        key={textInputField.id}
                        onClick={() => {
                          setSelectedField(textInputField.id);
                        }}
                        className={`flex items-center justify-between border-2 rounded-xl p-2 cursor-pointer ${
                          selectedField === textInputField.id
                            ? "bg-black border-black text-white"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Input
                            disabled={true}
                            id={textInputField.id + "fake-input"}
                            placeholder={textInputField.placeHolder}
                          ></Input>
                          <Label htmlFor={textInputField.id + "fake-input"}>
                            {textInputField.label}
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <ScrollArea className="h-[260px] w-1/2 rounded-md border p-4">
              {selectedField &&
                sections.map((mainSection) => (
                  <div key={mainSection.id}>
                    <p className="text-slate-500 text-sm">{mainSection.name}</p>
                    <Separator></Separator>
                    <div className="space-y-2 mt-2 mb-2">
                      {mainSection.inspectable_object_inspection_form_sub_section.map(
                        (subSection) => {
                          const isInAssigneSubSections = assignedSubSections[
                            subSection.id
                          ]
                            ? assignedSubSections[subSection.id].includes(
                                selectedField
                              )
                            : false;

                          return (
                            <div
                              key={subSection.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                checked={isInAssigneSubSections}
                                onCheckedChange={() =>
                                  assignToSubSection(subSection.id)
                                }
                                id={`subSections-${subSection.id}`}
                              />
                              <Label htmlFor={`subSections-${subSection.id}`}>
                                {subSection.name}
                              </Label>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))}
            </ScrollArea>
          </div>
          <div className="flex justify-end m-4">
            {Object.keys(assignedSubSections).length > 0 ? (
              <Button onClick={() => handleCreateTextInputFieldsInDB()}>
                Create
              </Button>
            ) : (
              <Button variant={"outline"}>Create</Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
