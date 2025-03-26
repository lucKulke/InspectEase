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
import { CheckboxGroupDialog, TaskDialog } from "./Dialogs";

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
  const [openTaskDialog, setOpenTaskDialog] = useState<boolean>(false);
  const [openCheckboxGroupDialog, setOpenCheckboxGroupDialog] =
    useState<boolean>(false);
  const [selectedCheckboxGroupId, setSelectedCheckboxGroupId] =
    useState<UUID>();

  const [selectedSubSectionId, setSelectedSubSectionId] = useState<UUID>();

  return (
    <div className="w-full border-2 rounded-r-xl p-4 border-gray-800 ">
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
                        setOpenTaskDialog={setOpenTaskDialog}
                        setOpenCheckboxGroupDialog={setOpenCheckboxGroupDialog}
                        setSelectedCheckboxGroupId={setSelectedCheckboxGroupId}
                        setSelectedSubSectionId={setSelectedSubSectionId}
                      />
                    </li>
                  )
                )}
              </ul>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>

      {selectedCheckboxGroupId && selectedSubSectionId && (
        <>
          <TaskDialog
            open={openTaskDialog}
            setOpen={setOpenTaskDialog}
            currentCheckboxGroupId={selectedCheckboxGroupId}
            setSubSectionsData={setSubSectionsData}
            subSectionsData={subSectionsData}
            subSectionId={selectedSubSectionId}
          />
          <CheckboxGroupDialog
            open={openCheckboxGroupDialog}
            setOpen={setOpenCheckboxGroupDialog}
            currentCheckboxGroupId={selectedCheckboxGroupId}
            setSubSectionsData={setSubSectionsData}
            subSectionsData={subSectionsData}
            subSectionId={selectedSubSectionId}
          />
        </>
      )}
    </div>
  );
};
