"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { FormSection } from "./FormSection";
import { UUID } from "crypto";
import { PDFViewer } from "@/components/PDFViewer";
import { FileText, Blocks } from "lucide-react";
import { ToolBar } from "./ToolBar/ToolBar";

interface EditorProps {
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

export const Editor = ({
  mainSubSection,
  bucketResponse,
  formId,
  subSectionData,
}: EditorProps) => {
  const [activeTab, setActiveTab] = useState<string>("Editor");

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

      <ToolBar
        sideBarData={mainSubSections}
        setSideBarData={setMainSubSections}
        formId={formId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSubSectionsData={setSubSectionsData}
        subSectionData={subSectionData}
      ></ToolBar>
    </div>
  );
};
