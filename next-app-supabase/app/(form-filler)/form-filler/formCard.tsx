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

import React from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash2 } from "lucide-react";
import { UUID } from "crypto";

interface FormCardProps {
  form: IFillableFormPlusFillableFields;
  selectedForm: UUID | undefined;
  setSelectedForm: React.Dispatch<React.SetStateAction<UUID | undefined>>;
  setOpenAlertDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FormCard = ({
  form,
  selectedForm,
  setSelectedForm,
  setOpenAlertDialog,
}: FormCardProps) => {
  const router = useRouter();
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

  console.log(progress);
  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger>
        <Card
          key={form.id}
          className="h-full hover:shadow-md transition-shadow "
        >
          <div className="flex justify-between">
            <CardHeader>
              <CardTitle>ID: {form.identifier_string}</CardTitle>
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
            <ul className="mb-4 space-y-2">
              {Object.entries(form.form_props).map(([key, value]) => {
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

            <Progress value={progress}></Progress>
            <div className="text-sm text-gray-500">
              Last updated:{" "}
              {format(
                new Date(form.updated_at || form.created_at),
                "MMM d, yyyy"
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={() => {
                router.push("/form/" + form.id);
              }}
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
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
