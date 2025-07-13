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
  ICheckboxGroupData,
  IFormData,
  IMainCheckboxData,
  IMainCheckboxResponse,
  IMainSectionResponse,
  ISubCheckboxResponse,
  ISubSectionResponse,
  ITaskResponse,
  ITextInputResponse,
  LogEntry,
} from "@/lib/database/form-filler/formFillerInterfaces";
import { UUID } from "crypto";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { TextInputField } from "./TextInputField";
import { updateMainCheckboxValue, updateTextInputFieldValue } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { Separator } from "@/components/ui/separator";
import { useFormActivity } from "@/hooks/useFormActivity";
import { motion, AnimatePresence } from "framer-motion";

import Bar, { useQueueProcessor, QueueLog, RecordingItem } from "./Bar";
import { createClient } from "@/utils/supabase/client";

interface FormCompProps {
  userId: string;
  formData: IFormData;
  subCheckboxes: Record<string, ISubCheckboxResponse[]>;
  mainCheckboxes: Record<string, IMainCheckboxResponse[]>;
  textInputFields: Record<string, ITextInputResponse[]>;
  sessionAwarenessFeatureUrl: string;
}

export const FormComp = ({
  userId,
  sessionAwarenessFeatureUrl,
  formData,
  subCheckboxes,
  mainCheckboxes,
  textInputFields,
}: FormCompProps) => {
  const supabase = createClient();
  // Register form activity and start heartbeat
  useFormActivity({
    formId: formData.id as string,
    userId,
    url: sessionAwarenessFeatureUrl,
  });

  const { showNotification } = useNotification();
  const [fillableSubCheckboxes, setFillableSubCheckboxes] =
    useState<Record<string, ISubCheckboxResponse[]>>(subCheckboxes);
  const [fillableMainCheckboxes, setFillableMainCheckboxes] =
    useState<Record<string, IMainCheckboxResponse[]>>(mainCheckboxes);
  const [fillableTextInputFields, setFillableTextInputFields] =
    useState<Record<string, ITextInputResponse[]>>(textInputFields);
  const [selectedMainSections, setSelectedMainSections] = useState<UUID[]>([]);
  const [selectedSubSections, setSelectedSubSections] = useState<UUID[]>([]);

  const [aiSelectedFields, setAiSelectedFields] = useState<UUID[]>([]);

  const handleAutoUpdateMainCheckbox = async (
    mainCheckboxId: UUID,
    checked: boolean,
    groupId: UUID
  ) => {
    const updatedMainCheckboxes = { ...fillableMainCheckboxes };

    updatedMainCheckboxes[groupId] = updatedMainCheckboxes[groupId].map(
      (mainCheckbox) => {
        if (mainCheckbox.id === mainCheckboxId) {
          mainCheckbox.checked = checked;
        }
        return mainCheckbox;
      }
    );

    setFillableMainCheckboxes(updatedMainCheckboxes);
  };

  const handleAutoUpdateSubCheckbox = async (
    subCheckboxId: UUID,
    checked: boolean,
    mainCheckboxId: UUID
  ) => {
    const updatedSubCheckboxes = { ...fillableSubCheckboxes };

    updatedSubCheckboxes[mainCheckboxId] = updatedSubCheckboxes[
      mainCheckboxId
    ].map((subCheckbox) => {
      if (subCheckbox.id === subCheckboxId) {
        subCheckbox.checked = checked;
      }
      return subCheckbox;
    });
    setFillableSubCheckboxes(updatedSubCheckboxes);
  };

  const handleAutoUpdateTextInputField = async (
    textInputFieldId: UUID,
    value: string,
    subCheckboxId: UUID
  ) => {
    const updatedTextInputFields = { ...fillableTextInputFields };
    updatedTextInputFields[subCheckboxId] = updatedTextInputFields[
      subCheckboxId
    ].map((textInput) => {
      if (textInput.id === textInputFieldId) {
        textInput.value = value;
      }
      return textInput;
    });
    setFillableTextInputFields(updatedTextInputFields);
  };

  useEffect(() => {
    // 2. Subscribe to INSERT, UPDATE, DELETE events
    const channel = supabase
      .channel(`realtime-form-${formData.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "form_filler",
          table: "main_checkbox",
          filter: `form_id=eq.${formData.id}`,
        },
        (payload) => {
          const { eventType, new: newRow, old } = payload;
          console.log("payload", payload);

          handleAutoUpdateMainCheckbox(
            newRow.id,
            newRow.checked,
            newRow.group_id
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "form_filler",
          table: "sub_checkbox",
          filter: `form_id=eq.${formData.id}`,
        },
        (payload) => {
          const { eventType, new: newRow, old } = payload;
          console.log("payload", payload);
          handleAutoUpdateSubCheckbox(
            newRow.id,
            newRow.checked,
            newRow.main_checkbox_id
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "form_filler",
          table: "text_input",
          filter: `form_id=eq.${formData.id}`,
        },
        (payload) => {
          const { eventType, new: newRow, old } = payload;
          console.log("payload", payload);
          handleAutoUpdateTextInputField(
            newRow.id,
            newRow.value,
            newRow.sub_section_id
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [formData.id]);

  useEffect(() => {
    if (aiSelectedFields) {
      const timer = setTimeout(() => {
        setAiSelectedFields([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [aiSelectedFields]);

  const handleExpandMainSection = (mainSectionId: UUID) => {
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

  const handleExpandSubSection = (subSectionId: UUID) => {
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

  const handleManualUpdateMainCheckbox = async (
    mainCheckboxId: UUID,
    checked: boolean
  ) => {
    const { updatedMainCheckbox, updatedMainCheckboxError } =
      await updateMainCheckboxValue(formData.id, mainCheckboxId, checked);
    if (updatedMainCheckboxError) {
      showNotification(
        "Update main checkbox",
        `Error: ${updatedMainCheckboxError.message} (${updatedMainCheckboxError.code})`,
        "error"
      );
      return;
    }
    // const copy = { ...fillableSubCheckboxes };
    // copy[mainCheckboxId] = copy[mainCheckboxId].map((subCheckbox) => {
    //   if (subCheckbox.id === mainCheckboxId) {
    //     subCheckbox.checked = checked;
    //   }
    //   return subCheckbox;
    // });
    // setFillableSubCheckboxes(copy);
  };

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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

  const [queue, setQueue] = useState<RecordingItem[]>([]);

  return (
    <div className="mb-36">
      <ul className="space-y-2">
        {formData.main_section.sort(sortMainSections).map((mainSection) => (
          <li key={mainSection.id}>
            <Card>
              <CardHeader
                className="cursor-pointer flex flex-row items-center space-y-0 py-4 select-none"
                onClick={() => handleExpandMainSection(mainSection.id)}
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

              <AnimatePresence initial={false}>
                {selectedMainSections.includes(mainSection.id) && (
                  <motion.div
                    key="main-content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { height: "auto", opacity: 1 },
                      collapsed: { height: 0, opacity: 0 },
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
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
                                    handleExpandSubSection(subSection.id)
                                  }
                                >
                                  <CardTitle className="flex-1 text-xl">
                                    {subSection.name}
                                  </CardTitle>
                                  {selectedSubSections.includes(
                                    subSection.id
                                  ) ? (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </CardHeader>

                                <AnimatePresence initial={false}>
                                  {selectedSubSections.includes(
                                    subSection.id
                                  ) && (
                                    <motion.div
                                      key="sub-content"
                                      initial="collapsed"
                                      animate="open"
                                      exit="collapsed"
                                      variants={{
                                        open: { height: "auto", opacity: 1 },
                                        collapsed: { height: 0, opacity: 0 },
                                      }}
                                      transition={{
                                        duration: 0.3,
                                        ease: "easeInOut",
                                      }}
                                      className="overflow-hidden"
                                    >
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
                                                        {selectionGroup.task
                                                          .length > 0 ? (
                                                          <Table>
                                                            <TableHeader>
                                                              <TableRow>
                                                                <TableHead className="text-left flex items-end">
                                                                  task
                                                                </TableHead>
                                                                {fillableMainCheckboxes[
                                                                  selectionGroup
                                                                    .id
                                                                ]
                                                                  .sort(
                                                                    sortMainCheckboxes
                                                                  )
                                                                  .map(
                                                                    (
                                                                      checkbox
                                                                    ) => (
                                                                      <TableHead
                                                                        className="text-center space-y-2 w-[100px]"
                                                                        key={
                                                                          checkbox.id +
                                                                          "head"
                                                                        }
                                                                      >
                                                                        <Checkbox
                                                                          disabled
                                                                          checked={
                                                                            checkbox.checked
                                                                          }
                                                                        ></Checkbox>
                                                                        <p>
                                                                          {
                                                                            checkbox.label
                                                                          }
                                                                        </p>
                                                                      </TableHead>
                                                                    )
                                                                  )}
                                                              </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                              {selectionGroup.task
                                                                .sort(sortTasks)
                                                                .map((task) => (
                                                                  <TableRow
                                                                    className={`${
                                                                      aiSelectedFields.includes(
                                                                        task.id
                                                                      ) &&
                                                                      "bg-green-300"
                                                                    }`}
                                                                    key={
                                                                      task.id +
                                                                      "tablerow"
                                                                    }
                                                                  >
                                                                    <TableCell className="font-medium text-left py-4">
                                                                      {
                                                                        task.description
                                                                      }
                                                                    </TableCell>
                                                                    {fillableMainCheckboxes[
                                                                      selectionGroup
                                                                        .id
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
                                                                                onClick={() => {}}
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
                                                              .sort(
                                                                sortMainCheckboxes
                                                              )
                                                              .map(
                                                                (
                                                                  mainCheckbox
                                                                ) => {
                                                                  return (
                                                                    <div
                                                                      className={`flex items-center space-x-2 ${
                                                                        aiSelectedFields.includes(
                                                                          mainCheckbox.id
                                                                        ) &&
                                                                        "bg-green-300"
                                                                      }`}
                                                                      key={
                                                                        mainCheckbox.id
                                                                      }
                                                                    >
                                                                      <Checkbox
                                                                        checked={
                                                                          mainCheckbox.checked
                                                                        }
                                                                        onClick={() => {}}
                                                                      ></Checkbox>
                                                                      <p>
                                                                        {
                                                                          mainCheckbox.label
                                                                        }
                                                                      </p>
                                                                    </div>
                                                                  );
                                                                }
                                                              )}
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
                                        {(
                                          fillableTextInputFields[
                                            subSection.id
                                          ] ?? []
                                        ).length > 0 && (
                                          <ul className="mt-5">
                                            {fillableTextInputFields[
                                              subSection.id
                                            ]
                                              .sort(sortTextInputFields)
                                              .map((inputField) => {
                                                return (
                                                  <li key={inputField.id}>
                                                    <TextInputField
                                                      aiSelectedFields={
                                                        aiSelectedFields
                                                      }
                                                      handleSaveNewTextInput={
                                                        handleSaveNewTextInput
                                                      }
                                                      fillableInputField={
                                                        inputField
                                                      }
                                                    ></TextInputField>
                                                  </li>
                                                );
                                              })}
                                          </ul>
                                        )}
                                      </CardContent>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </Card>
                            </li>
                          ))}
                      </ul>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </li>
        ))}
      </ul>
      <QueueLog queue={queue} />
      <Bar queue={queue} setQueue={setQueue} />
    </div>
  );
};
