"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IFormData,
  IMainCheckboxResponse,
  IMainSectionResponse,
  ISubCheckboxResponse,
  ISubSectionResponse,
  ITaskResponse,
  ITextInputResponse,
} from "@/lib/database/form-filler/formFillerInterfaces";
import { UUID } from "crypto";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { TextInputField } from "./TextInputField";
import {
  updateMainCheckboxValue,
  updateSubCheckboxValue,
  updateTextInputFieldValue,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { Separator } from "@/components/ui/separator";
//import { TextInputField } from "./TextInputField";

interface MainCompProps {
  formData: IFormData;
  subCheckboxes: Record<string, ISubCheckboxResponse[]>;

  mainCheckboxes: Record<string, IMainCheckboxResponse[]>;

  textInputFields: Record<string, ITextInputResponse[]>;
}

export const MainComp = ({
  formData,
  subCheckboxes,
  mainCheckboxes,
  textInputFields,
}: MainCompProps) => {
  const { showNotification } = useNotification();
  const [fillableSubCheckboxes, setFillableSubCheckboxes] =
    useState<Record<string, ISubCheckboxResponse[]>>(subCheckboxes);

  const [fillableMainCheckboxes, setFillableMainCheckboxes] =
    useState<Record<string, IMainCheckboxResponse[]>>(mainCheckboxes);

  const [fillableTextInputFields, setFillableTextInputFields] =
    useState<Record<string, ITextInputResponse[]>>(textInputFields);

  const [selectedMainSections, setSelectedMainSections] = useState<UUID[]>([]);
  const [selectedSubSections, setSelectedSubSections] = useState<UUID[]>([]);

  const handleSelectMainSection = (mainSectionId: UUID) => {
    if (selectedMainSections.includes(mainSectionId)) {
      setSelectedMainSections((prev) =>
        prev.filter((mainSection) => mainSection !== mainSectionId)
      );
    } else {
      setSelectedMainSections((prev) => {
        const copy = [...prev];
        copy.push(mainSectionId);
        return copy;
      });
    }
  };

  const handleSelectSubSection = (subSectionId: UUID) => {
    if (selectedSubSections.includes(subSectionId)) {
      setSelectedSubSections((prev) =>
        prev.filter((subSection) => subSection !== subSectionId)
      );
    } else {
      setSelectedSubSections((prev) => {
        const copy = [...prev];
        copy.push(subSectionId);
        return copy;
      });
    }
  };

  const handleCheckSubCheckbox = async (
    mainCheckboxId: UUID,
    checkboxId: UUID
  ) => {
    let newValue: boolean = false;
    const copy = { ...fillableSubCheckboxes };
    copy[mainCheckboxId] = copy[mainCheckboxId].map((subCheckbox) => {
      if (subCheckbox.id === checkboxId) {
        subCheckbox.checked = subCheckbox.checked ? false : true;
        newValue = subCheckbox.checked;
      }
      return subCheckbox;
    });

    setFillableSubCheckboxes(copy);
    await updateSubCheckboxValue(formData.id, checkboxId, newValue);
  };

  const handleCheckMainCheckbox = async (
    subSectionId: UUID,
    checkboxId: UUID
  ) => {
    let newValue: boolean = false;
    const copy = { ...fillableMainCheckboxes };
    copy[subSectionId] = copy[subSectionId].map((mainCheckbox) => {
      if (mainCheckbox.id === checkboxId) {
        mainCheckbox.checked = mainCheckbox.checked ? false : true;
        newValue = mainCheckbox.checked;
      }
      return mainCheckbox;
    });

    setFillableMainCheckboxes(copy);
    await updateMainCheckboxValue(formData.id, checkboxId, newValue);
  };

  const handleSaveNewTextInput = async (
    subSectionId: UUID,
    textInputFieldId: UUID,
    value: string
  ) => {
    const { updatedTextInputField, updatedTextInputFieldError } =
      await updateTextInputFieldValue(formData.id, textInputFieldId, value);
    if (updatedTextInputFieldError) {
      showNotification(
        "Fetch SubSections Data",
        `Error: ${updatedTextInputFieldError.message} (${updatedTextInputFieldError.code})`,
        "error"
      );
      return;
    }

    const copy = { ...fillableTextInputFields };
    copy[subSectionId] = copy[subSectionId].map((textInput) => {
      if (textInput.id === textInputFieldId) {
        textInput.value = value;
      }
      return textInput;
    });

    setFillableTextInputFields(copy);
  };

  function sortMainSections(a: IMainSectionResponse, b: IMainSectionResponse) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  function sortSubSections(a: ISubSectionResponse, b: ISubSectionResponse) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  function sortMainCheckboxes(
    a: IMainCheckboxResponse,
    b: IMainCheckboxResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  function sortTasks(a: ITaskResponse, b: ITaskResponse) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  function sortTextInputFields(a: ITextInputResponse, b: ITextInputResponse) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <div>
      <ul className="space-y-2">
        {formData.main_section.sort(sortMainSections).map((mainSection) => (
          <li key={mainSection.id}>
            <Card>
              <CardHeader
                className="cursor-pointer flex flex-row items-center space-y-0 py-4 select-none"
                onClick={() => handleSelectMainSection(mainSection.id)}
              >
                <CardTitle className="flex-1 text-xl">
                  {mainSection.name}
                </CardTitle>
                {selectedMainSections.includes(mainSection.id) ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </CardHeader>
              {selectedMainSections.includes(mainSection.id) && (
                <CardContent>
                  <ul className="space-y-4">
                    {mainSection.sub_section
                      .sort(sortSubSections)
                      .map((subSection) => (
                        <li className={subSection.id} key={subSection.id}>
                          <Card>
                            <CardHeader
                              className="cursor-pointer flex flex-row items-center space-y-0 py-4 select-none"
                              onClick={() =>
                                handleSelectSubSection(subSection.id)
                              }
                            >
                              <CardTitle className="flex-1 text-xl">
                                {subSection.name}
                              </CardTitle>
                              {selectedSubSections.includes(subSection.id) ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                            </CardHeader>
                            {selectedSubSections.includes(subSection.id) && (
                              <CardContent className="pt-2 pb-6">
                                <ul className="space-y-4">
                                  {subSection.checkbox_group.map(
                                    (selectionGroup) => (
                                      <li key={selectionGroup.id}>
                                        <ul className="space-y-2">
                                          <li key={selectionGroup.id}>
                                            <Card>
                                              <CardHeader>
                                                <CardTitle>
                                                  {selectionGroup.name}
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent>
                                                {selectionGroup.task.length >
                                                0 ? (
                                                  <Table>
                                                    <TableHeader>
                                                      <TableRow>
                                                        <TableHead className="text-left">
                                                          task
                                                        </TableHead>
                                                        {fillableMainCheckboxes[
                                                          selectionGroup.id
                                                        ]
                                                          .sort(
                                                            sortMainCheckboxes
                                                          )
                                                          .map((checkbox) => (
                                                            <TableHead
                                                              className="text-center w-[100px]"
                                                              key={
                                                                checkbox.id +
                                                                "head"
                                                              }
                                                            >
                                                              {checkbox.label}
                                                            </TableHead>
                                                          ))}
                                                      </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                      {selectionGroup.task
                                                        .sort(sortTasks)
                                                        .map((task) => (
                                                          <TableRow
                                                            key={
                                                              task.id +
                                                              "tablerow"
                                                            }
                                                          >
                                                            <TableCell className="font-medium text-left py-4">
                                                              {task.description}
                                                            </TableCell>
                                                            {fillableMainCheckboxes[
                                                              selectionGroup.id
                                                            ]
                                                              .sort(
                                                                sortMainCheckboxes
                                                              )
                                                              .map(
                                                                (
                                                                  mainCheckbox
                                                                ) => {
                                                                  const currentCheckbox =
                                                                    fillableSubCheckboxes[
                                                                      mainCheckbox
                                                                        .id
                                                                    ].filter(
                                                                      (
                                                                        subCheckbox
                                                                      ) =>
                                                                        subCheckbox.task_id ===
                                                                        task.id
                                                                    )[0];

                                                                  return (
                                                                    <TableCell
                                                                      key={
                                                                        currentCheckbox.id +
                                                                        "cell"
                                                                      }
                                                                      className="font-medium text-center whitespace-nowrap py-4"
                                                                    >
                                                                      <Checkbox
                                                                        checked={
                                                                          currentCheckbox.checked
                                                                        }
                                                                        onClick={() => {
                                                                          handleCheckSubCheckbox(
                                                                            mainCheckbox.id,
                                                                            currentCheckbox.id
                                                                          );
                                                                        }}
                                                                      ></Checkbox>
                                                                    </TableCell>
                                                                  );
                                                                }
                                                              )}
                                                          </TableRow>
                                                        ))}
                                                    </TableBody>
                                                  </Table>
                                                ) : (
                                                  <div>
                                                    {fillableMainCheckboxes[
                                                      selectionGroup.id
                                                    ]
                                                      .sort(sortMainCheckboxes)
                                                      .map((mainCheckbox) => {
                                                        return (
                                                          <div
                                                            className="flex items-center space-x-2"
                                                            key={
                                                              mainCheckbox.id
                                                            }
                                                          >
                                                            <Checkbox
                                                              checked={
                                                                mainCheckbox.checked
                                                              }
                                                              onClick={() => {
                                                                handleCheckMainCheckbox(
                                                                  selectionGroup.id,
                                                                  mainCheckbox.id
                                                                );
                                                              }}
                                                            ></Checkbox>
                                                            <p>
                                                              {
                                                                mainCheckbox.label
                                                              }
                                                            </p>
                                                          </div>
                                                        );
                                                      })}
                                                  </div>
                                                )}
                                              </CardContent>
                                            </Card>
                                          </li>
                                        </ul>
                                      </li>
                                    )
                                  )}
                                </ul>
                                <Separator className="mt-5"></Separator>
                                {(fillableTextInputFields[subSection.id] ?? [])
                                  .length > 0 && (
                                  <ul className="mt-5">
                                    {fillableTextInputFields[subSection.id]
                                      .sort(sortTextInputFields)
                                      .map((inputField) => {
                                        return (
                                          <li key={inputField.id}>
                                            <TextInputField
                                              handleSaveNewTextInput={
                                                handleSaveNewTextInput
                                              }
                                              fillableInputField={inputField}
                                            ></TextInputField>
                                          </li>
                                        );
                                      })}
                                  </ul>
                                )}
                              </CardContent>
                            )}
                          </Card>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
};
