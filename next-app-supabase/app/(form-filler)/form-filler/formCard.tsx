import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IconType, profileIcons } from "@/lib/availableIcons";
import {
  IFillableFormPlusFillableFields,
  IFillableFormResponse,
} from "@/lib/database/form-filler/formFillerInterfaces";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import React, { useState } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash2 } from "lucide-react";
import { UUID } from "crypto";
import { fillPDF, updateFormProgressState } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActiveForm, DashboardActiveForm } from "@/lib/globalInterfaces";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { IUserProfileResponse } from "@/lib/database/public/publicInterface";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Eye, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import UserIndicatorOverlay from "@/components/UserIndicatorOverlay";

interface FormCardProps {
  userId: string;
  form: IFillableFormPlusFillableFields;
  selectedForm: UUID | undefined;
  setSelectedForm: React.Dispatch<React.SetStateAction<UUID | undefined>>;
  setOpenAlertDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setFillableForms: React.Dispatch<
    React.SetStateAction<IFillableFormPlusFillableFields[]>
  >;
  isBeeingEdited: DashboardActiveForm;
  teamMembers: IUserProfileResponse[] | null;
  teamMemberProfilePictures: Record<UUID, string | undefined>;
}

export const FormCard = ({
  userId,
  form,
  selectedForm,
  setSelectedForm,
  setOpenAlertDialog,
  setFillableForms,
  isBeeingEdited,
  teamMembers,
  teamMemberProfilePictures,
}: FormCardProps) => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [isExpanded, setIsExpanded] = useState(false);
  let max = 0;
  let filled = 0;
  form.main_section.forEach((main) => {
    main.sub_section.forEach((sub) => {
      sub.text_input.forEach((text) => {
        if (text.value) {
          if (text.value.length > 0) {
            filled += 1;
          }
        }
        max += 1;
      });

      sub.checkbox_group.forEach((group) => {
        let atLeastOneMain = 0;

        group.main_checkbox.forEach((mainCheckbox) => {
          if (mainCheckbox.checked) {
            if (atLeastOneMain === 0) atLeastOneMain += 1;
          }
        });

        filled += atLeastOneMain;
        max += 1;
      });
    });
  });

  const progress = filled / (max / 100);
  const completed = progress === 100;

  const updateProgressValue = async (value: boolean) => {
    const { updatedForm, updatedFormError } = await updateFormProgressState(
      form.id,
      value
    );
    if (updatedFormError) {
      showNotification(
        "Update form progress prop",
        `Error: ${updatedFormError.message} (${updatedFormError.code})`,
        "error"
      );
    } else if (updatedForm) {
      setFillableForms((prev) =>
        prev.map((form) => {
          if (form.id === updatedForm.id) {
            form.in_progress = value;
          }
          return form;
        })
      );
    }
  };

  const exportToPdf = async (form: IFillableFormPlusFillableFields) => {
    const { resultBlob, error } = await fillPDF(form);

    if (error) {
      showNotification("Error during pdf export", "Message: " + error, "error");
    }

    if (resultBlob) {
      const downloadUrl = URL.createObjectURL(resultBlob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "filled.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsExpanded(!isExpanded);
  };

  console.log("isBeeingEdited", isBeeingEdited);
  console.log("user id", userId);
  let currentUsers = isBeeingEdited
    ? isBeeingEdited.users.map((editingUserId) =>
        teamMembers?.find((member) => member.user_id === editingUserId)
      )
    : [];

  let allreadyWorkingOnIt = false;
  currentUsers = currentUsers.filter((user) => {
    if (user?.user_id !== userId) {
      return user;
    } else {
      allreadyWorkingOnIt = true;
    }
  });

  // let allUsers = isBeeingEdited?.users;
  // let currentUsers: IUserProfileResponse[] = [];

  // if (allUsers) {
  //   Object.entries(allUsers).forEach(([editingUserIds, sessions]) => {
  //     let temp = teamMembers?.find(
  //       (member) => member.user_id === editingUserIds
  //     );

  //     if (temp) currentUsers.push(temp);
  //   });
  // }

  //currentUsers
  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger>
        <Card
          key={form.id}
          className={`h-full hover:shadow-md transition-shadow relative max-w-[400px] overflow-hidden ${
            isBeeingEdited && "border-blue-600"
          }`}
        >
          {/* Indicator Badge */}
          {allreadyWorkingOnIt && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-2 rounded-full bg-blue-600 text-white px-3 py-1 shadow-md text-xs font-medium">
              <span className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c0 .943-.79 1.71-1.75 1.71-.96 0-1.75-.767-1.75-1.71s.79-1.71 1.75-1.71c.96 0 1.75.767 1.75 1.71zM19 11c0 .943-.79 1.71-1.75 1.71-.96 0-1.75-.767-1.75-1.71s.79-1.71 1.75-1.71c.96 0 1.75.767 1.75 1.71z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 15c-2.21 0-4 1.567-4 3.5v.5h8v-.5c0-1.933-1.79-3.5-4-3.5zM16 15c-2.21 0-4 1.567-4 3.5v.5h8v-.5c0-1.933-1.79-3.5-4-3.5z"
                  />
                </svg>
                You’re working on this
              </span>
            </div>
          )}
          {isBeeingEdited && currentUsers.length > 0 && (
            <UserIndicatorOverlay
              isBeeingEdited={isBeeingEdited}
              currentUsers={currentUsers as IUserProfileResponse[]}
              teamMemberProfilePictures={
                teamMemberProfilePictures as Record<UUID, string>
              }
              position="top-right"
              type="absolute"
            ></UserIndicatorOverlay>
          )}
          {/* Current Users Indicator Overlay */}
          <div className="flex justify-between mt-2">
            <CardHeader>
              <CardTitle>ID: {form.identifier_string} </CardTitle>
              <CardDescription>{form.form_type}</CardDescription>
            </CardHeader>
            <div className="m-7">
              <HoverCard>
                <HoverCardTrigger className="cursor-pointer">
                  {profileIcons[form.object_profile_icon as IconType]}
                </HoverCardTrigger>
                <HoverCardContent>
                  <p className="font-bold mb-2">{form.object_profile_name}</p>
                  <ul className=" space-y-2">
                    {Object.entries(form.object_props).map(([key, value]) => {
                      return (
                        <li
                          key={key + form.id}
                          className="flex space-x-2 items-center"
                        >
                          <p className="text-slate-600 text-sm">{key}:</p>{" "}
                          <p>{value}</p>
                        </li>
                      );
                    })}
                  </ul>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
          <CardContent>
            <p className="text-sm text-gray-600">Metadata:</p>
            <ScrollArea className="h-44 border-2 p-2 w-full  rounded-xl mb-3">
              <ul className="mb-4 space-y-2">
                {Object.entries(form.form_props).map(([key, value]) => {
                  return (
                    <li
                      key={key + form.id}
                      className="flex space-x-2 items-center"
                    >
                      <p className="font-bold whitespace-nowrap text-sm">
                        {key}:
                      </p>
                      <p className="truncate overflow-hidden whitespace-nowrap text-ellipsis flex-1">
                        {value}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>

            <Progress value={progress}></Progress>
            <div className="text-sm text-gray-500">
              Last updated:{" "}
              {format(
                new Date(form.updated_at || form.created_at),
                "MMM d, yyyy"
              )}
            </div>
          </CardContent>
          {form.in_progress ? (
            <CardFooter
              className={`flex ${
                completed ? "justify-between" : "justify-end"
              }`}
            >
              {completed && (
                <Button
                  className="animate-pulse"
                  onClick={() => {
                    updateProgressValue(false);
                  }}
                >
                  Completed
                </Button>
              )}

              <Button
                onClick={() => {
                  router.push("/form/" + form.id);
                }}
              >
                Continue
              </Button>
            </CardFooter>
          ) : (
            <CardFooter className="flex justify-end">
              <Button onClick={() => updateProgressValue(true)}>Edit</Button>
            </CardFooter>
          )}
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          className=""
          onClick={() => {
            router.push("/form-editor/" + form.build_id);
          }}
        >
          Visit build
        </ContextMenuItem>
        <ContextMenuItem
          className=""
          onClick={() => {
            exportToPdf(form);
          }}
        >
          Export to PDF
        </ContextMenuItem>
        <ContextMenuItem
          className="text-red-500 flex justify-between"
          onClick={() => {
            setSelectedForm(form.id);
            setOpenAlertDialog(true);
          }}
        >
          delete <Trash2></Trash2>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
