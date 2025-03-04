"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { FormSection } from "./Editor/FormSection";
import { UUID } from "crypto";
import { PDFViewer } from "@/components/PDFViewer";
import { FileText, Blocks } from "lucide-react";

interface EditorSectionProps {
  mainSubSection: IInspectableObjectInspectionFormMainSectionWithSubSection[];
  bucketResponse: {
    signedUrl: string;
  } | null;
  formId: UUID;
  subSectionData: Record<
    UUID,
    IInspectableObjectInspectionFormSubSectionWithData
  >;
}

export const EditorSection = ({
  mainSubSection,
  bucketResponse,
  formId,
  subSectionData,
}: EditorSectionProps) => {
  const [activeTab, setActiveTab] = useState<string>("Editor");

  const toggleTab = () => {
    setActiveTab((prevTab) => (prevTab === "Editor" ? "Document" : "Editor"));
  };
  const [mainSubSections, setMainSubSections] =
    useState<IInspectableObjectInspectionFormMainSectionWithSubSection[]>(
      mainSubSection
    );

  const [subSectionsData, setSubSectionsData] =
    useState<Record<UUID, IInspectableObjectInspectionFormSubSectionWithData>>(
      subSectionData
    );

  return (
    <div className="mt-6 ">
      {activeTab === "Editor" ? (
        <FormSection
          formId={formId}
          mainSectionsWithSubSections={mainSubSections}
          setMainSectionsWithSubSections={setMainSubSections}
          subSectionsData={subSectionsData}
          setSubSectionsData={setSubSectionsData}
        ></FormSection>
      ) : (
        <div className="h-screen p-4">
          {bucketResponse && (
            <PDFViewer pdfUrl={bucketResponse.signedUrl}></PDFViewer>
          )}
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.ul
          key={activeTab} // Ensures re-animation on change
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-200 rounded-full p-2 shadow-lg">
            <button
              onClick={toggleTab}
              className={`px-4 py-2 rounded-full transition flex items-center ${
                activeTab === "Editor"
                  ? "bg-blue-500 text-white"
                  : "bg-transparent text-gray-500"
              }`}
            >
              <Blocks className="text-xl" />
            </button>
            <button
              onClick={toggleTab}
              className={`px-4 py-2 rounded-full transition flex items-center ${
                activeTab === "Document"
                  ? "bg-blue-500 text-white"
                  : "bg-transparent text-gray-500"
              }`}
            >
              <FileText className="text-xl" />
            </button>
          </div>
        </motion.ul>
      </AnimatePresence>
    </div>
  );
};
