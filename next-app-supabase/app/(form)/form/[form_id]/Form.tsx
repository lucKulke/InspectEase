"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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

import { ChevronDown, ChevronRight } from "lucide-react";
import React, { act, use, useEffect, useState } from "react";
import { TextInputField } from "./TextInputField";
import {
  takeoverSession,
  updateMainCheckboxValue,
  updateSubCheckboxValue,
  updateTextInputFieldValue,
  upsertMainCheckboxesValues,
  upsertSubCheckboxesValues,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { Separator } from "@/components/ui/separator";
import { useFormActivity } from "@/hooks/useFormActivity";
import { motion, AnimatePresence } from "framer-motion";
//import Bar, { useQueueProcessor, QueueLog } from "./Bar";
import { RecordingItem } from "./Bar";
import { createClient } from "@/utils/supabase/client";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ActiveForm } from "@/lib/globalInterfaces";
import { IUserProfileResponse } from "@/lib/database/public/publicInterface";
import UserIndicatorOverlay from "@/components/UserIndicatorOverlay";
import { v4 as uuidv4 } from "uuid";
import { UUID } from "crypto";

interface FormCompProps {
  sessionId: string;
  userId: string;
  formData: IFormData;
  subCheckboxes: Record<string, ISubCheckboxResponse[]>;
  mainCheckboxes: Record<string, IMainCheckboxResponse[]>;
  textInputFields: Record<string, ITextInputResponse[]>;
  sessionAwarenessRegistrationUrl: string;
  sessionAwarenessMonitoringWsUrl: string;
  teamMembers: IUserProfileResponse[] | null;
  profilePictures: Record<UUID, string | undefined>;
}
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("formSessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("formSessionId", sessionId);
  }
  return sessionId;
};
export const FormComp = ({
  sessionId,
  userId,
  sessionAwarenessRegistrationUrl,
  sessionAwarenessMonitoringWsUrl,
  formData,
  subCheckboxes,
  mainCheckboxes,
  textInputFields,
  teamMembers,
  profilePictures,
}: FormCompProps) => {
  const currentSessionId = getSessionId();
  const supabase = createClient();
  const [isMonitoring, setIsMonitoring] = useState(true);
  // Register form activity and start heartbeat
  useFormActivity({
    formId: formData.id,
    userId,
    url: sessionAwarenessRegistrationUrl,
    sessionId: currentSessionId,
  });
  const { data: activeForms, isConnected } = useWebSocket<ActiveForm>(
    sessionAwarenessMonitoringWsUrl
  );

  let allUsers = activeForms?.users;
  let currentUsers: IUserProfileResponse[] = [];
  let sessionType: string = "Unknown";
  if (allUsers) {
    Object.entries(allUsers).forEach(([editingUserIds, sessions]) => {
      let temp = teamMembers?.find(
        (member) => member.user_id === editingUserIds
      );
      if (editingUserIds === userId) {
        Object.values(sessions).forEach((session) => {
          sessionType = session[currentSessionId];
        });
      }
      if (temp) currentUsers.push(temp);
    });
  }

  currentUsers = currentUsers.filter((user) => user?.user_id !== userId);

  const sendSessionTakeOverCommand = async () => {
    takeoverSession(formData.id, userId, currentSessionId);
  };
  const monitoring = sessionType === "monitor";

  useEffect(() => {
    console.log("------- monitoring state ----", monitoring);
    console.log("------- session type ----", sessionType); // Log the sessionType
    setIsMonitoring(sessionType === "monitor");
  }, [monitoring]);
  // const [monitoring, setMonitoring] = useState<boolean>(

  // );

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

  const [selectedByUser, setSelectedByUser] = useState<UUID[]>([]);

  const handleAutoUpdateMainCheckbox = async (
    mainCheckboxId: UUID,
    checked: boolean,
    groupId: UUID
  ) => {
    console.log("AUTOUPDATE MAINCHECKBOX");
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
    console.log("AUTOUPDATE SUBCHECKBOX");
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
          console.log("main checkbox payload", newRow);
          //if (userId === newRow.updated_by) return;
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
          //console.log("sub checkbox payload", newRow);
          //if (userId === newRow.updated_by) return;
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
          console.log("text inputpayload", newRow);
          //if (userId === newRow.updated_by) return;
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

  // ------------- HANDLE CHECKBOX STATE CHANGES FOR BETTER PERFORMANCE --------------
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

  // ----------------------------

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
  //console.log("active forms", activeForms);

  // useEffect(() => {
  //   console.log("activeForms", activeForms);
  // }, [activeForms]);

  // ); // remove currentcurrentUsers
  // console.log("currentUserMoreThanOneSession", currentUserMoreThanOneSession);
  // if (currentUserMoreThanOneSession.length > 1) {
  //   //console.log("currentUserMoreThanOneSession", currentUserMoreThanOneSession);
  // }
  // currentUsers = currentUsers.filter((user) => user?.user_id !== userId);

  return (
    <div className="mb-36">
      {monitoring && (
        <button onClick={sendSessionTakeOverCommand}>Takeover</button>
      )}

      {currentUsers && (
        <UserIndicatorOverlay
          isBeeingEdited={activeForms}
          currentUsers={currentUsers as IUserProfileResponse[]}
          teamMemberProfilePictures={profilePictures as Record<UUID, string>}
          position="top-right"
          type="fixed"
        ></UserIndicatorOverlay>
      )}
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
                                                                                disabled={
                                                                                  monitoring
                                                                                }
                                                                                checked={
                                                                                  currentCheckbox.checked
                                                                                }
                                                                                onClick={() => {
                                                                                  console.log(
                                                                                    "need to increase over time",
                                                                                    selectedByUser
                                                                                  );
                                                                                  setSelectedByUser(
                                                                                    (
                                                                                      prev
                                                                                    ) => [
                                                                                      ...prev,
                                                                                      currentCheckbox.id,
                                                                                    ]
                                                                                  );
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
                                                                        disabled={
                                                                          monitoring
                                                                        }
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
                                                      disabled={monitoring}
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
      {/* <QueueLog queue={queue} />
      <Bar queue={queue} setQueue={setQueue} /> */}
    </div>
  );
};
