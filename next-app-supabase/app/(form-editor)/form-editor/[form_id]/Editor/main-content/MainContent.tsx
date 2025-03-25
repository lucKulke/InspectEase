"use client";
import {
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useEffect, useState } from "react";
import { SubSection } from "./SubSection";
import { motion, AnimatePresence } from "framer-motion";
import { UUID } from "crypto";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MainContentProps {
  mainSubSections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
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

export const MainContent = ({
  mainSubSections,
  subSectionsData,
  setSubSectionsData,
}: MainContentProps) => {
  return (
    <div className="w-full border-2 rounded-r-xl p-4 border-black ">
      <AnimatePresence mode="wait">
        <motion.ul
          key={JSON.stringify(mainSubSections)} // Ensures re-animation on change
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {mainSubSections.map((mainSubSection) => (
            <li key={mainSubSection.id} className="group mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p
                      id={mainSubSection.id}
                      className="group-hover:underline "
                    >
                      {mainSubSection.name}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{mainSubSection.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <ul className="space-y-2">
                {mainSubSection.inspectable_object_inspection_form_sub_section.map(
                  (subSection) => (
                    <li key={subSection.id} id={subSection.id}>
                      <SubSection
                        subSectionName={subSection.name}
                        subSectionDescription={subSection.description}
                        subSectionId={subSection.id}
                        subSectionsData={subSectionsData}
                        setSubSectionsData={setSubSectionsData}
                      />
                    </li>
                  )
                )}
              </ul>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
};
