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
  changeUserColor,
  refetchTeamMembers,
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
import { useFormRealtime } from "@/hooks/useFormRealtime";
import { useFocusSync } from "@/hooks/useFocusSync";
import { scrollToSection } from "@/utils/general";
import { ColorPicker } from "./ColorPicker";

const availableColors = ["red", "blue", "green", "yellow", "purple"];
interface FormCompProps {
  sessionId: string;
  userId: string;
  formData: IFormData;
  subCheckboxes: Record<string, ISubCheckboxResponse[]>;
  mainCheckboxes: Record<string, IMainCheckboxResponse[]>;
  textInputFields: Record<string, ITextInputResponse[]>;
  sessionAwarenessRegistrationUrl: string;
  sessionAwarenessFormActivityWsUrl: string;
  sessionAwarenessFocusWsUrl: string;
  teamMemberList: IUserProfileResponse[] | null;
  profilePictures: Record<UUID, string | undefined>;
}
const getSessionData = () => {
  let sessionId = sessionStorage.getItem("formSessionId");

  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem("formSessionId", sessionId);
  }

  return { sessionId };
};
export const FormComp = ({
  sessionId,
  userId,
  sessionAwarenessRegistrationUrl,
  sessionAwarenessFormActivityWsUrl,
  sessionAwarenessFocusWsUrl,
  formData,
  subCheckboxes,
  mainCheckboxes,
  textInputFields,
  teamMemberList,
  profilePictures,
}: FormCompProps) => {
  const [teamMembers, setTeamMembers] = useState<IUserProfileResponse[] | null>(
    teamMemberList
  );
  const currentSessionData = getSessionData();
  const supabase = createClient();

  // teamMemberColors[userId] = currentSessionData.userColor;
  // Register form activity and start heartbeat
  useFormActivity({
    formId: formData.id,
    userId,
    url: sessionAwarenessRegistrationUrl,
    sessionId: currentSessionData.sessionId,
  });
  const { data: activeForms, isConnected } = useWebSocket<ActiveForm>(
    sessionAwarenessFormActivityWsUrl
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
          sessionType = session[currentSessionData.sessionId];
        });
      }
      if (temp) currentUsers.push(temp);
    });
  }

  currentUsers = currentUsers.filter((user) => user?.user_id !== userId);

  const sendSessionTakeOverCommand = async () => {
    takeoverSession(formData.id, userId, currentSessionData.sessionId);
  };
  const monitoring = sessionType === "monitor";

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
    groupId: UUID,
    updatedBy: UUID
  ) => {
    console.log("AUTOUPDATE MAINCHECKBOX");
    const updatedMainCheckboxes = { ...fillableMainCheckboxes };

    updatedMainCheckboxes[groupId] = updatedMainCheckboxes[groupId].map(
      (mainCheckbox) => {
        if (mainCheckbox.id === mainCheckboxId) {
          mainCheckbox.checked = checked;
          mainCheckbox.updated_by = updatedBy;
        }
        return mainCheckbox;
      }
    );

    setFillableMainCheckboxes(updatedMainCheckboxes);
  };

  const handleAutoUpdateSubCheckbox = async (
    subCheckboxId: UUID,
    checked: boolean,
    mainCheckboxId: UUID,
    updatedBy: UUID
  ) => {
    console.log("AUTOUPDATE SUBCHECKBOX");
    const updatedSubCheckboxes = { ...fillableSubCheckboxes };

    updatedSubCheckboxes[mainCheckboxId] = updatedSubCheckboxes[
      mainCheckboxId
    ].map((subCheckbox) => {
      if (subCheckbox.id === subCheckboxId) {
        subCheckbox.checked = checked;
        subCheckbox.updated_by = updatedBy;
      }
      return subCheckbox;
    });
    setFillableSubCheckboxes(updatedSubCheckboxes);
  };

  const handleAutoUpdateTextInputField = async (
    textInputFieldId: UUID,
    value: string,
    subCheckboxId: UUID,
    updatedBy: UUID
  ) => {
    const updatedTextInputFields = { ...fillableTextInputFields };
    updatedTextInputFields[subCheckboxId] = updatedTextInputFields[
      subCheckboxId
    ].map((textInput) => {
      if (textInput.id === textInputFieldId) {
        textInput.value = value;
        textInput.updated_by = updatedBy;
      }
      return textInput;
    });
    setFillableTextInputFields(updatedTextInputFields);
  };

  useFormRealtime({
    formId: formData.id,
    onMainCheckboxUpdate: handleAutoUpdateMainCheckbox,
    onSubCheckboxUpdate: handleAutoUpdateSubCheckbox,
    onTextInputUpdate: handleAutoUpdateTextInputField,
    supabase: supabase,
  });

  useFocusSync(formData.id, userId, formData.id, sessionAwarenessFocusWsUrl);

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

  useEffect(() => {
    const ws = new WebSocket(sessionAwarenessFocusWsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "focus_update") {
        const { main_section_id, sub_section_id, field_id } = data;
        console.log("is also monitoring", monitoring);
        console.log("Received focus update:", data);

        // Expand main section
        if (monitoring) {
          if (!selectedMainSections.includes(main_section_id)) {
            handleExpandMainSection(main_section_id);
          }
          if (!selectedSubSections.includes(sub_section_id)) {
            handleExpandSubSection(sub_section_id);
          }

          // Expand sub-section

          // Scroll to the field

          setTimeout(() => {
            console.log("Scrolling to field:", field_id);
            const fieldElement = document.querySelector(
              `[data-field-id="${field_id}"]`
            );
            if (fieldElement) {
              console.log("found element");
              fieldElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 1200);
        }
      }
    };
    ws.onopen = () => {
      console.log("WebSocket connection opened for focus update");
    };

    return () => ws.close();
  }, [formData.id, monitoring]);

  const handleChangeUserColor = async (color: string) => {
    const { updatedProfile, updatedProfileError } = await changeUserColor(
      userId as UUID,
      color
    );

    if (updatedProfile) {
      const { teamMembers, teamMembersError } = await refetchTeamMembers();
      if (teamMembers) {
        setTeamMembers(teamMembers);
      }
    }
  };

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
          <li key={mainSection.id} data-main-section-id={mainSection.id}>
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
                            <li
                              className={subSection.id}
                              key={subSection.id}
                              data-sub-section-id={subSection.id}
                            >
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
                                                                          data-field-id={
                                                                            checkbox.id
                                                                          }
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
                                                                .map((task) => {
                                                                  return (
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

                                                                            let color =
                                                                              currentCheckbox.checked &&
                                                                              currentCheckbox.updated_by &&
                                                                              teamMembers?.find(
                                                                                (
                                                                                  member
                                                                                ) =>
                                                                                  member.user_id ===
                                                                                  currentCheckbox.updated_by
                                                                              )
                                                                                ?.color;

                                                                            return (
                                                                              <TableCell
                                                                                key={
                                                                                  currentCheckbox.id +
                                                                                  "cell"
                                                                                }
                                                                                className={`font-medium text-center whitespace-nowrap py-4 `}
                                                                              >
                                                                                <div
                                                                                  className={`p-1  flex justify-center items-center rounded-xl `}
                                                                                  style={{
                                                                                    backgroundColor:
                                                                                      color ||
                                                                                      "#ffffff",
                                                                                  }}
                                                                                >
                                                                                  <Checkbox
                                                                                    data-field-id={
                                                                                      currentCheckbox.id
                                                                                    }
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
                                                                                </div>
                                                                              </TableCell>
                                                                            );
                                                                          }
                                                                        )}
                                                                    </TableRow>
                                                                  );
                                                                })}
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
                                                                  let color =
                                                                    mainCheckbox.checked &&
                                                                    mainCheckbox.updated_by &&
                                                                    teamMembers?.find(
                                                                      (
                                                                        member
                                                                      ) =>
                                                                        member.user_id ===
                                                                        mainCheckbox.updated_by
                                                                    )?.color;
                                                                  return (
                                                                    <div
                                                                      className={`flex items-center space-x-2 `}
                                                                      key={
                                                                        mainCheckbox.id
                                                                      }
                                                                    >
                                                                      <div
                                                                        className={`pl-2 pr-2 space-x-3 flex justify-center items-center rounded-xl `}
                                                                        style={{
                                                                          backgroundColor:
                                                                            color ||
                                                                            "#ffffff",
                                                                        }}
                                                                      >
                                                                        <Checkbox
                                                                          data-field-id={
                                                                            mainCheckbox.id
                                                                          }
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
                                                      teamMembers={teamMembers}
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
      {!monitoring && (
        <ColorPicker
          onColorSelect={handleChangeUserColor}
          originalColor={
            teamMembers?.find((member) => member.user_id === userId)?.color ??
            "#ffffff"
          }
        />
      )}
    </div>
  );
};
