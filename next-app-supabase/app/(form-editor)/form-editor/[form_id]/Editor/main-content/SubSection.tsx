"use client";
import {
  IFormCheckboxGroupWithCheckboxes,
  IFormCheckboxResponse,
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useEffect, useState } from "react";
import { DiscAlbum, Divide, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UUID } from "crypto";
import { Skeleton } from "@/components/ui/skeleton";

import { useNotification } from "@/app/context/NotificationContext";
import { Spinner } from "@/components/Spinner";

import {
  deleteMultipleChoiceGroup,
  deleteSingleChoiceGroup,
  deleteTextInputGroup,
  updateCheckboxesOrderNumber,
} from "./actions";
import { flushSync } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Reorder } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

interface SubSectionProps {
  subSectionId: UUID;
  subSectionsData: Record<
    UUID,
    IInspectableObjectInspectionFormSubSectionWithData
  >;
  setSubSectionsData: React.Dispatch<
    React.SetStateAction<
      Record<UUID, IInspectableObjectInspectionFormSubSectionWithData>
    >
  >;
}

interface GroupState {
  multi: boolean;
  single: boolean;
  text: boolean;
}

export const SubSection = ({
  subSectionId,
  subSectionsData,
  setSubSectionsData,
}: SubSectionProps) => {
  const { showNotification } = useNotification();

  const [sectionData, setSectionData] =
    useState<IInspectableObjectInspectionFormSubSectionWithData>(
      subSectionsData[subSectionId]
    );

  const updateCheckboxOrderInDB = async (
    updatedItems: IFormCheckboxResponse[]
  ) => {
    const { updatedFormCheckboxes, updatedFormCheckboxesError } =
      await updateCheckboxesOrderNumber(updatedItems);

    if (updatedFormCheckboxesError) {
      showNotification(
        "Main section order",
        `Error: ${updatedFormCheckboxesError.message} (${updatedFormCheckboxesError.code})`,
        "error"
      );
    }
  };

  const debouncedCheckboxUpdate = debounce(updateCheckboxOrderInDB, 500);

  const reorderItems = (newOrder: IFormCheckboxResponse[]) => {
    return newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1,
    }));
  };

  const handleCheckboxesReorder = (newOrder: IFormCheckboxResponse[]) => {
    console.log("reorder");
    const updatedItems = reorderItems(newOrder);
    setSectionData((prev) => {
      const copyOfSectionData = { ...sectionData };
      copyOfSectionData.form_checkbox_group = prev.form_checkbox_group.map(
        (checkboxGroup) => {
          if (checkboxGroup.id === newOrder[0].group_id) {
            checkboxGroup.form_checkbox = updatedItems;
          }
          return checkboxGroup;
        }
      );
      return copyOfSectionData;
    });

    debouncedCheckboxUpdate(updatedItems);
  };

  function compareCheckboxOrderNumbers(
    a: IFormCheckboxResponse,
    b: IFormCheckboxResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }
  return (
    <div className="border-2">
      <p>{sectionData.name}</p>
      {sectionData.form_checkbox_group.map((group) => {
        return (
          <div key={group.id}>
            <Card key={group.id}>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  {group.form_checkbox.length} checkbox
                  {group.form_checkbox.length !== 1 ? "es" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {group.form_checkbox.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No checkboxes in this group.
                  </p>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={group.form_checkbox}
                    onReorder={handleCheckboxesReorder}
                    className="space-y-2 "
                  >
                    {group.form_checkbox
                      .sort(compareCheckboxOrderNumbers)
                      .map((checkbox) => (
                        <Reorder.Item
                          key={checkbox.id}
                          value={checkbox}
                          className="cursor-grab flex items-center space-x-2"
                          dragConstraints={{ top: 0, bottom: 0 }}
                        >
                          <Checkbox
                            checked={true}
                            id={`preview-${group.id}-${checkbox.id}`}
                          />
                          <Label htmlFor={`preview-${group.id}-${checkbox.id}`}>
                            {checkbox.label}
                          </Label>
                        </Reorder.Item>
                      ))}
                  </Reorder.Group>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
