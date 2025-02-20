import React, { useState } from "react";
import { Reorder } from "framer-motion";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IInspectableObjectInspectionFormMainSectionResponse,
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionInsert,
  IInspectableObjectInspectionFormSubSectionResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { createNewSubSection, updateSubSectionOrder } from "../actions";
import { useNotification } from "@/app/context/NotificationContext";
import { Ellipsis, Trash2 } from "lucide-react";

const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

interface SubSectionsProps {
  mainSectionWithSubsections: IInspectableObjectInspectionFormMainSectionWithSubSection;
}

export const SubSections = ({
  mainSectionWithSubsections,
}: SubSectionsProps) => {
  const { showNotification } = useNotification();

  const [sections, setSections] = useState<
    IInspectableObjectInspectionFormSubSectionResponse[]
  >(mainSectionWithSubsections.inspectable_object_inspection_form_sub_section);

  const updateSubSectionOrderInDB = async (
    updatedItems: IInspectableObjectInspectionFormSubSectionResponse[]
  ) => {
    const {
      updatedInspectableObjectInspectionFormSubSections,
      updatedInspectableObjectInspectionFormSubSectionsError,
    } = await updateSubSectionOrder(updatedItems);

    if (updatedInspectableObjectInspectionFormSubSectionsError) {
      showNotification(
        "Sub section order",
        `Error: ${updatedInspectableObjectInspectionFormSubSectionsError.message} (${updatedInspectableObjectInspectionFormSubSectionsError.code})`,
        "error"
      );
    }
  };

  const debouncedSubSectionUpdate = debounce(updateSubSectionOrderInDB, 500);
  const reorderItems = (
    newOrder: IInspectableObjectInspectionFormSubSectionResponse[]
  ) => {
    return newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1,
    }));
  };

  const handleSubSectionReorder = (
    newOrder: IInspectableObjectInspectionFormSubSectionResponse[]
  ) => {
    const updatedItems = reorderItems(newOrder);
    setSections(updatedItems);
    debouncedSubSectionUpdate(updatedItems);
  };

  function compareSubSections(
    a: IInspectableObjectInspectionFormSubSectionResponse,
    b: IInspectableObjectInspectionFormSubSectionResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <Reorder.Group
      axis="y"
      values={sections}
      onReorder={handleSubSectionReorder}
      className={`space-y-2  p-2 ${
        sections.length > 0 && "border-2 rounded-xl"
      } cursor-default `}
    >
      {sections.sort(compareSubSections).map((subSection) => (
        <Reorder.Item
          key={subSection.id}
          value={subSection}
          className="flex items-center justify-between bg-white border p-4 rounded-md shadow cursor-grab "
          dragConstraints={{ top: 0, bottom: 0 }}
        >
          <span className="text-gray-500 font-bold w-6">
            {subSection.order_number}.
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-slate-600 font-bold">{subSection.name}</p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{subSection.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <Ellipsis className="text-slate-500 "></Ellipsis>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-red-600" onClick={() => {}}>
                delete <Trash2></Trash2>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};
