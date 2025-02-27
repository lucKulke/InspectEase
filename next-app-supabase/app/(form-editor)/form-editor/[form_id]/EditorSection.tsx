"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IInspectableObjectInspectionFormMainSectionWithSubSection } from "@/lib/database/form-builder/formBuilderInterfaces";

import React, { useState } from "react";
import { FormSection } from "./Editor/FormSection";
import { UUID } from "crypto";
import { PDFViewer } from "@/components/PDFViewer";
import { Trash2, Car } from "lucide-react";

interface EditorSectionProps {
  mainSubSection: IInspectableObjectInspectionFormMainSectionWithSubSection[];
  bucketResponse: {
    signedUrl: string;
  } | null;
  formId: UUID;
}

export const EditorSection = ({
  mainSubSection,
  bucketResponse,
  formId,
}: EditorSectionProps) => {
  const [activeTab, setActiveTab] = useState("Editor");

  const toggleTab = () => {
    setActiveTab((prevTab) => (prevTab === "Editor" ? "Document" : "Editor"));
  };
  const [mainSubSections, setMainSubSections] =
    useState<IInspectableObjectInspectionFormMainSectionWithSubSection[]>(
      mainSubSection
    );

  return (
    <div className="mt-6 ">
      {activeTab === "Editor" ? (
        <FormSection
          formId={formId}
          mainSectionsWithSubSections={mainSubSections}
          setMainSectionsWithSubSections={setMainSubSections}
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
          key={JSON.stringify(mainSubSections)} // Ensures re-animation on change
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
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
              <Car className="text-xl" />
            </button>
            <button
              onClick={toggleTab}
              className={`px-4 py-2 rounded-full transition flex items-center ${
                activeTab === "Document"
                  ? "bg-blue-500 text-white"
                  : "bg-transparent text-gray-500"
              }`}
            >
              <Trash2 className="text-xl" />
            </button>
          </div>
        </motion.ul>
      </AnimatePresence>
    </div>
  );
};
