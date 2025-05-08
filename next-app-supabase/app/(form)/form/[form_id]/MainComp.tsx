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
import {
  updateMainCheckboxValue,
  upsertSubCheckboxesValues,
  updateSubCheckboxValue,
  updateTextInputFieldValue,
  upsertMainCheckboxesValues,
  requestIntentRecognition,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { Separator } from "@/components/ui/separator";
import { constructNow } from "date-fns";
import { IFormCheckboxResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { useFormActivity } from "@/hooks/useFormActivity";
import { AIInteractionBar } from "./AIInteractionBar";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuid4 } from "uuid";
import { LogStream } from "./LogStream";
//import { TextInputField } from "./TextInputField";

interface MainCompProps {
  formData: IFormData;
  subCheckboxes: Record<string, ISubCheckboxResponse[]>;

  mainCheckboxes: Record<string, IMainCheckboxResponse[]>;

  textInputFields: Record<string, ITextInputResponse[]>;
  sessionAwarenessFeatureUrl: string;
}

export const MainComp = ({
  sessionAwarenessFeatureUrl,
  formData,
  subCheckboxes,
  mainCheckboxes,
  textInputFields,
}: MainCompProps) => {
  const [userId, setUserId] = useState<string>("");
  useEffect(() => {
    // For demo, generate a random user ID if not available
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = `user-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("userId", newUserId);
      setUserId(newUserId);
    }
  }, []);

  // Register form activity and start heartbeat
  useFormActivity({
    formId: formData.id as string,
    userId,
    url: sessionAwarenessFeatureUrl,
  });
  const [aiLogs, setAiLogs] = useState<LogEntry[]>([]);
  const [logsOpen, setLogsOpen] = useState<boolean>(true);
  const [aiConnectionStatus, setAiConnectionStatus] =
    useState<string>("not connected");

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

  useEffect(() => {
    if (aiSelectedFields) {
      const timer = setTimeout(() => {
        setAiSelectedFields([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [aiSelectedFields]);

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

  const currentFillState = (selectionGroup: ICheckboxGroupData) => {
    const copy = { ...fillableSubCheckboxes };
    const taskState: Record<UUID, Record<UUID, boolean>> = {};
    selectionGroup.task.forEach((task) => {
      selectionGroup.main_checkbox.forEach((mainCheckbox) => {
        copy[mainCheckbox.id].forEach((subCheckbox) => {
          if (subCheckbox.task_id === task.id) {
            if (subCheckbox.checked) {
              if (taskState[task.id]) {
                taskState[task.id][mainCheckbox.id] = true;
              } else {
                const temp: Record<UUID, boolean> = {};
                temp[mainCheckbox.id] = true;
                taskState[task.id] = temp;
              }
            } else {
              if (taskState[task.id]) {
                taskState[task.id][mainCheckbox.id] = false;
              } else {
                const temp: Record<UUID, boolean> = {};
                temp[mainCheckbox.id] = false;
                taskState[task.id] = temp;
              }
            }
          }
        });
      });
    });
    return taskState;
  };

  function sortByPrioNumber(a: IMainCheckboxData, b: IMainCheckboxData) {
    if (a.prio_number < b.prio_number) return -1;

    if (a.prio_number > b.prio_number) return 1;

    return 0;
  }

  const handleCheckSubCheckbox = async (
    mainCheckboxId: UUID,
    checkboxId: UUID,
    selectionGroup: ICheckboxGroupData,
    taskId: UUID
  ) => {
    let newValue: boolean = false;
    let unCheck: ISubCheckboxResponse[] = [];
    const copy = { ...fillableSubCheckboxes };
    copy[mainCheckboxId] = copy[mainCheckboxId].map((subCheckbox) => {
      if (subCheckbox.id === checkboxId) {
        console.log(selectionGroup.checkboxes_selected_together);
        console.log(
          selectionGroup.checkboxes_selected_together?.includes(mainCheckboxId)
        );

        if (subCheckbox.checked) {
          subCheckbox.checked = false;
          newValue = false;
        } else {
          selectionGroup.main_checkbox.forEach((mainCheckbox) => {
            const row = copy[mainCheckbox.id].filter(
              (subCheck) => subCheck.task_id === taskId
            );

            const subCheck = row.filter(
              (subCheck) => subCheck.id !== subCheckbox.id
            )[0];
            subCheck ? unCheck.push(subCheck) : null;
            subCheckbox.checked = true;
            newValue = true;
          });
        }
      }
      return subCheckbox;
    });

    console.log("uncheck list", unCheck);

    const checkboxesThatNeedToBeUnchecked: ISubCheckboxResponse[] = [];

    if (
      !selectionGroup.checkboxes_selected_together?.includes(mainCheckboxId)
    ) {
      unCheck.forEach((subCheckbox) => {
        let mainCheckbox: string | null = null;
        for (const [key, value] of Object.entries(copy)) {
          value.forEach((sub) => {
            if (sub.id === subCheckbox.id) {
              mainCheckbox = key;
            }
          });
        }

        if (mainCheckbox) {
          copy[mainCheckbox].map((sub) => {
            if (sub.id === subCheckbox.id) {
              sub.checked = false;
              checkboxesThatNeedToBeUnchecked.push(sub);
            }
            return sub;
          });
        }
      });
    } else {
      unCheck.forEach((subCheckbox) => {
        let mainCheckbox: string | null = null;
        for (const [key, value] of Object.entries(copy)) {
          value.forEach((sub) => {
            if (sub.id === subCheckbox.id) {
              mainCheckbox = key;
            }
          });
        }
        if (
          mainCheckbox &&
          !selectionGroup.checkboxes_selected_together?.includes(mainCheckbox)
        ) {
          copy[mainCheckbox].map((sub) => {
            if (sub.id === subCheckbox.id) {
              sub.checked = false;
              checkboxesThatNeedToBeUnchecked.push(sub);
            }
            return sub;
          });
        }
      });
    }

    setFillableSubCheckboxes(copy);

    handleAutoCheckMainCheckbox(selectionGroup);

    await updateSubCheckboxValue(formData.id, checkboxId, newValue);
    await upsertSubCheckboxesValues(checkboxesThatNeedToBeUnchecked);
  };

  const handleAutoCheckMainCheckbox = async (
    selectionGroup: ICheckboxGroupData
  ) => {
    const fillState = currentFillState(selectionGroup);
    const keysWithTrue = Object.keys(fillState).filter((key) =>
      Object.values(fillState[key as UUID]).some((v) => v)
    );

    const isFilled = keysWithTrue.length === selectionGroup.task.length;

    console.log("fillstate", fillState);
    console.log("isFilled", isFilled);

    if (isFilled) {
      const copy = { ...fillableMainCheckboxes };
      const upsertList: IMainCheckboxResponse[] = [];
      const checkedMainCheckboxes: Record<string, boolean> = {};

      for (const currentMainCheckbox of selectionGroup.main_checkbox) {
        const isChecked = currentMainCheckbox.sub_checkbox.some(
          (subCheckbox) => subCheckbox.checked
        );
        if (isChecked) {
          checkedMainCheckboxes[currentMainCheckbox.id] = true;
        }
      }

      const checkedIds = Object.keys(checkedMainCheckboxes);
      const togetherGroupSet = new Set(
        selectionGroup.checkboxes_selected_together
      );

      // Determine if all checked are in "selectable together" list
      const allInGroup = checkedIds.every((id) => togetherGroupSet.has(id));

      let selectedIds: string[] = [];

      if (checkedIds.length === 1) {
        selectedIds = checkedIds;
      } else if (allInGroup) {
        selectedIds = checkedIds;
      } else {
        // pick the one with highest prioritization
        const prioritized = selectionGroup.main_checkbox
          .filter((cb) => checkedMainCheckboxes[cb.id])
          .sort((a, b) => a.prio_number - b.prio_number)[0];
        if (prioritized) {
          selectedIds = [prioritized.id];
        }
      }

      // Now apply the selection to checkboxes
      copy[selectionGroup.id] = copy[selectionGroup.id].map((mainCheckbox) => {
        const shouldBeChecked = selectedIds.includes(mainCheckbox.id);
        if (mainCheckbox.checked !== shouldBeChecked) {
          mainCheckbox.checked = shouldBeChecked;
          upsertList.push(mainCheckbox);
        }
        return mainCheckbox;
      });

      setFillableMainCheckboxes(copy);
      await upsertMainCheckboxesValues(upsertList);
    } else {
      // uncheck all main checkboxes

      const copy = { ...fillableMainCheckboxes };
      let unCheck: IMainCheckboxResponse[] = [];

      copy[selectionGroup.id] = copy[selectionGroup.id].map((mainCheckbox) => {
        mainCheckbox.checked = false;
        unCheck.push(mainCheckbox);
        return mainCheckbox;
      });
      setFillableMainCheckboxes(copy);
      await upsertMainCheckboxesValues(unCheck);
    }
  };

  const handleCheckMainCheckbox = async (
    checkboxId: UUID,
    selectionGroup: ICheckboxGroupData
  ) => {
    let newValue: boolean = false;
    const copy = { ...fillableMainCheckboxes };
    let unCheck: IMainCheckboxResponse[] = [];

    copy[selectionGroup.id] = copy[selectionGroup.id].map((mainCheckbox) => {
      if (mainCheckbox.id === checkboxId) {
        mainCheckbox.checked = !mainCheckbox.checked;
        newValue = mainCheckbox.checked;
      } else {
        if (selectionGroup.checkboxes_selected_together?.includes(checkboxId)) {
          if (
            !selectionGroup.checkboxes_selected_together?.includes(
              mainCheckbox.id
            )
          ) {
            mainCheckbox.checked = false;
            unCheck.push(mainCheckbox);
          }
        } else {
          mainCheckbox.checked = false;
          unCheck.push(mainCheckbox);
        }
      }

      return mainCheckbox;
    });

    setFillableMainCheckboxes(copy);
    await updateMainCheckboxValue(formData.id, checkboxId, newValue);
    await upsertMainCheckboxesValues(unCheck);
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

  const handeAiCheckSubCheckbox = async (
    mainCheckboxId: UUID,
    checkboxId: UUID,
    selectionGroup: ICheckboxGroupData,
    taskId: UUID,
    value: boolean
  ) => {
    let newValue: boolean = false;
    let unCheck: ISubCheckboxResponse[] = [];
    const copy = { ...fillableSubCheckboxes };
    copy[mainCheckboxId] = copy[mainCheckboxId].map((subCheckbox) => {
      if (subCheckbox.id === checkboxId) {
        console.log(selectionGroup.checkboxes_selected_together);
        console.log(
          selectionGroup.checkboxes_selected_together?.includes(mainCheckboxId)
        );

        if (value == false) {
          subCheckbox.checked = false;
          newValue = false;
        } else {
          selectionGroup.main_checkbox.forEach((mainCheckbox) => {
            const row = copy[mainCheckbox.id].filter(
              (subCheck) => subCheck.task_id === taskId
            );

            const subCheck = row.filter(
              (subCheck) => subCheck.id !== subCheckbox.id
            )[0];
            subCheck ? unCheck.push(subCheck) : null;
            subCheckbox.checked = value;
            newValue = value;
          });
        }
      }
      return subCheckbox;
    });

    console.log("uncheck list", unCheck);

    const checkboxesThatNeedToBeUnchecked: ISubCheckboxResponse[] = [];

    if (
      !selectionGroup.checkboxes_selected_together?.includes(mainCheckboxId)
    ) {
      unCheck.forEach((subCheckbox) => {
        let mainCheckbox: string | null = null;
        for (const [key, value] of Object.entries(copy)) {
          value.forEach((sub) => {
            if (sub.id === subCheckbox.id) {
              mainCheckbox = key;
            }
          });
        }

        if (mainCheckbox) {
          copy[mainCheckbox].map((sub) => {
            if (sub.id === subCheckbox.id) {
              sub.checked = false;
              checkboxesThatNeedToBeUnchecked.push(sub);
            }
            return sub;
          });
        }
      });
    } else {
      unCheck.forEach((subCheckbox) => {
        let mainCheckbox: string | null = null;
        for (const [key, value] of Object.entries(copy)) {
          value.forEach((sub) => {
            if (sub.id === subCheckbox.id) {
              mainCheckbox = key;
            }
          });
        }
        if (
          mainCheckbox &&
          !selectionGroup.checkboxes_selected_together?.includes(mainCheckbox)
        ) {
          copy[mainCheckbox].map((sub) => {
            if (sub.id === subCheckbox.id) {
              sub.checked = false;
              checkboxesThatNeedToBeUnchecked.push(sub);
            }
            return sub;
          });
        }
      });
    }

    setFillableSubCheckboxes(copy);

    handleAutoCheckMainCheckbox(selectionGroup);

    await updateSubCheckboxValue(formData.id, checkboxId, newValue);
    await upsertSubCheckboxesValues(checkboxesThatNeedToBeUnchecked);
  };

  const getMainCheckboxIdAndSelectionGroupAndTaskIdbasedOnCheckboxId = (
    checkboxId: string
  ): {
    sub: {
      mainSection: UUID;
      subSection: UUID;
      mainCheckboxId: UUID;
      selectionGroup: ICheckboxGroupData;
      taskId: UUID;
    } | null;
    main: {
      mainSection: UUID;
      subSection: UUID;
      selectionGroup: ICheckboxGroupData;
    } | null;
  } | null => {
    let data = null;
    formData.main_section.forEach((mainSection) => {
      mainSection.sub_section.forEach((subSection) => {
        subSection.checkbox_group.forEach((group) => {
          group.main_checkbox.forEach((mainCheckbox) => {
            if (mainCheckbox.id === checkboxId) {
              data = {
                main: {
                  mainSection: mainSection.id,
                  subSection: subSection.id,
                  selectionGroup: group,
                },
                sub: null,
              };
              return;
            }
            mainCheckbox.sub_checkbox.forEach((subCheckbox) => {
              console.log(subCheckbox.id, checkboxId);
              if (subCheckbox.id === checkboxId) {
                data = {
                  sub: {
                    mainSection: mainSection.id,
                    subSection: subSection.id,
                    mainCheckboxId: mainCheckbox.id,
                    selectionGroup: group,
                    taskId: subCheckbox.task_id,
                  },
                  main: null,
                };
                return;
              }
            });
          });
        });
      });
    });

    return data;
  };

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const getSubSectionOfTextInputField = (
    textInputFieldId: UUID
  ): { subSection: UUID; mainSection: UUID } | null => {
    let subSectionId = null;
    formData.main_section.forEach((mainSection) => {
      mainSection.sub_section.forEach((subSection) => {
        subSection.text_input.forEach((textInputField) => {
          if (textInputField.id === textInputFieldId)
            subSectionId = {
              subSection: subSection.id,
              mainSection: mainSection.id,
            };
        });
      });
    });
    return subSectionId;
  };

  const processAiResponse = async (userInput: string) => {
    const ws = await connectToIntentLogs(formData.id);
    const response = await requestIntentRecognition(
      formData.id,
      userInput,
      formData.id
    );
    console.log("response", response);

    if (response) {
      if (response.checkboxes.length > 0) {
        for (let index = 0; index < response.checkboxes.length; index++) {
          const checkbox = response.checkboxes[index];
          console.log(checkbox);
          const data =
            getMainCheckboxIdAndSelectionGroupAndTaskIdbasedOnCheckboxId(
              checkbox.id
            );
          if (data) {
            console.log("set checkboxes", data);
            if (checkbox.checked)
              if (data.sub) {
                setSelectedMainSections((prev) => {
                  if (data.sub && !prev.includes(data.sub.mainSection)) {
                    prev.push(data.sub.mainSection);
                  }
                  return prev;
                });
                setSelectedSubSections((prev) => {
                  if (data.sub && !prev.includes(data.sub.subSection)) {
                    prev.push(data.sub.subSection);
                  }
                  return prev;
                });
                await handeAiCheckSubCheckbox(
                  data.sub.mainCheckboxId,
                  checkbox.id as UUID,
                  data.sub.selectionGroup,
                  data.sub.taskId,
                  checkbox.checked
                );
                const copy = [...aiSelectedFields, data.sub.taskId as UUID];
                setAiSelectedFields(copy);
              } else if (data.main) {
                setSelectedMainSections((prev) => {
                  if (data.main && !prev.includes(data.main.mainSection)) {
                    prev.push(data.main.mainSection);
                  }
                  return prev;
                });
                setSelectedSubSections((prev) => {
                  if (data.main && !prev.includes(data.main.subSection)) {
                    prev.push(data.main.subSection);
                  }
                  return prev;
                });
                await handleCheckMainCheckbox(
                  checkbox.id as UUID,
                  data.main.selectionGroup
                );
                setAiSelectedFields((prev) => [...prev, checkbox.id as UUID]);
              }
            await sleep(500);
          }
        }
      }
      if (response.textInputFields.length > 0) {
        for (let index = 0; index < response.textInputFields.length; index++) {
          const textInputField = response.textInputFields[index];
          const data = getSubSectionOfTextInputField(textInputField.id as UUID);
          console.log("subsection id", data);

          if (data) {
            setSelectedMainSections((prev) => {
              if (!prev.includes(data.mainSection)) {
                prev.push(data.mainSection);
              }
              return prev;
            });
            setSelectedSubSections((prev) => {
              if (!prev.includes(data.subSection)) {
                prev.push(data.subSection);
              }
              return prev;
            });
            await handleSaveNewTextInput(
              data.subSection,
              textInputField.id as UUID,
              textInputField.value
            );
            setAiSelectedFields((prev) => [...prev, textInputField.id as UUID]);
          }
          await sleep(500);
        }
      }
    }
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

  const connectToIntentLogs = async (uuid: string) => {
    setAiConnectionStatus("connecting");
    const ws = new WebSocket(`ws://localhost:8000/intent-logs/ws`);

    ws.onopen = () => {
      ws.send(uuid); // Send UUID first
      setAiConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      if (event.data === "DONE") {
        ws.close();
        setAiConnectionStatus("disconnected");
      } else {
        const newLogEntry: LogEntry = JSON.parse(event.data);
        console.log("get message", event.data.toString());
        setAiLogs((prev) => [...prev, newLogEntry]);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
      ws.close();
      setAiConnectionStatus("disconnected");
    };

    return ws;
  };

  return (
    <div className="mb-12">
      <LogStream
        logs={aiLogs}
        setLogs={setAiLogs}
        connectionStatus={aiConnectionStatus}
        isOpen={logsOpen}
        setIsOpen={setLogsOpen}
      ></LogStream>
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
                                    handleSelectSubSection(subSection.id)
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
                                                                                onClick={() => {
                                                                                  handleCheckSubCheckbox(
                                                                                    mainCheckbox.id,
                                                                                    currentCheckbox.id,
                                                                                    selectionGroup,
                                                                                    task.id
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
                                                                        onClick={() => {
                                                                          handleCheckMainCheckbox(
                                                                            mainCheckbox.id,
                                                                            selectionGroup
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
      <AIInteractionBar
        processAiResposne={processAiResponse}
        formId={formData.id}
      ></AIInteractionBar>
    </div>
  );
};
