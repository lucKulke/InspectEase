"use client";
import { IInspectableObjectInspectionFormMainSectionWithSubSection } from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useEffect, useState } from "react";
import { SubSection } from "./SubSection";
import { motion, AnimatePresence } from "framer-motion";

interface MainContentProps {
  mainSubSections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
}

export const MainContent = ({ mainSubSections }: MainContentProps) => {
  const [sections, setSections] = useState(mainSubSections);

  useEffect(() => {
    setSections(mainSubSections);
  }, [mainSubSections]);

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.ul
          key={JSON.stringify(sections)} // Ensures re-animation on change
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {sections.map((mainSubSection) => (
            <li key={mainSubSection.id} className="group mt-2">
              <p className="group-hover:underline ">{mainSubSection.name}</p>
              <ul>
                {mainSubSection.inspectable_object_inspection_form_sub_section.map(
                  (subSection) => (
                    <li key={subSection.id}>
                      <SubSection subSection={subSection} />
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
