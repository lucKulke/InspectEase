"use client";
import React, { useRef, useState } from "react";
import { FormSideBar } from "./sidebar/SideBar";

import { ErrorHandler } from "@/components/ErrorHandler";
import { error } from "console";
import { UUID } from "crypto";
import {
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { MainContent } from "./main-content/MainContent";
import { GripVertical, SeparatorVertical } from "lucide-react";

interface MainFormSectionProps {
  formId: UUID;
  mainSectionsWithSubSections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
  setMainSectionsWithSubSections: React.Dispatch<
    React.SetStateAction<
      IInspectableObjectInspectionFormMainSectionWithSubSection[]
    >
  >;
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

export const FormSection = ({
  formId,
  mainSectionsWithSubSections,
  setMainSectionsWithSubSections,
  subSectionsData,
  setSubSectionsData,
}: MainFormSectionProps) => {
  const [width, setWidth] = useState(400); // Initial sidebar width
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(400); // Store initial width during drag start

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX; // Store starting mouse position
    startWidth.current = width; // Store starting sidebar width

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current) {
      const deltaX = e.clientX - startX.current; // Difference from start
      setWidth(Math.max(150, startWidth.current + deltaX)); // Adjust width smoothly
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex">
      <div className="sticky top-0 flex h-screen">
        {/* Sidebar */}
        <aside
          className="h-screen rounded-l-xl bg-gray-800 text-white p-4 flex-shrink-0"
          style={{ width: `${width}px` }}
        >
          <FormSideBar
            formId={formId}
            setMainSubSections={setMainSectionsWithSubSections}
            mainSubSections={mainSectionsWithSubSections}
            setSubSectionsData={setSubSectionsData}
          />
        </aside>

        {/* Sticky Resizer */}
        <div
          className="w-2 cursor-ew-resize bg-gray-600 hover:bg-gray-500 flex items-center relative"
          onMouseDown={handleMouseDown}
        >
          {/* Knob for better grip */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-400 hover:bg-gray-300 rounded-full flex items-center justify-center">
            <GripVertical size={16} className="text-gray-700" />
          </div>
        </div>
      </div>
      <MainContent
        mainSubSections={mainSectionsWithSubSections}
        subSectionsData={subSectionsData}
        setSubSectionsData={setSubSectionsData}
      ></MainContent>
    </div>
  );
};
