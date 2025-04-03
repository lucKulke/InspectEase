"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionWithData,
  IStringExtractionTrainingResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { FormSection } from "./FormSection";
import { UUID } from "crypto";
import { PDFViewer } from "@/components/PDFViewer";
import { FileText, Blocks } from "lucide-react";
import { ToolBar } from "./ToolBar/ToolBar";
import { fetchAllFormData } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

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
  trainingList: IStringExtractionTrainingResponse[] | undefined;
}

export const Editor = ({
  mainSubSection,
  bucketResponse,
  formId,
  subSectionData,
  trainingList,
}: EditorProps) => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<string>("Editor");

  const [mainSubSections, setMainSubSections] =
    useState<IInspectableObjectInspectionFormMainSectionWithSubSection[]>(
      mainSubSection
    );

  const [subSectionsData, setSubSectionsData] =
    useState<Record<UUID, IInspectableObjectInspectionFormSubSectionWithData>>(
      subSectionData
    );

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const refetchSubSectionsData = async () => {
    await delay(500);
    const {
      inspectableObjectInspectionFormMainSectionsWithSubSectionData,
      inspectableObjectInspectionFormMainSectionsWithSubSectionDataError,
    } = await fetchAllFormData(formId);

    if (inspectableObjectInspectionFormMainSectionsWithSubSectionDataError)
      return showNotification(
        "Fetch SubSections Data",
        `Error: ${inspectableObjectInspectionFormMainSectionsWithSubSectionDataError.message} (${inspectableObjectInspectionFormMainSectionsWithSubSectionDataError.code})`,
        "error"
      );

    const data: Record<
      UUID,
      IInspectableObjectInspectionFormSubSectionWithData
    > = {};
    inspectableObjectInspectionFormMainSectionsWithSubSectionData.forEach(
      (mainSection) => {
        mainSection.inspectable_object_inspection_form_sub_section.forEach(
          (subSection) => {
            data[subSection.id] = subSection;
          }
        );
      }
    );
    console.log("update subsection data");
    setSubSectionsData(data);
  };

  return (
    <div className="mt-6 ">
      {activeTab === "Editor" ? (
        <FormSection
          formId={formId}
          mainSectionsWithSubSections={mainSubSections}
          setMainSectionsWithSubSections={setMainSubSections}
          subSectionsData={subSectionsData}
          setSubSectionsData={setSubSectionsData}
          trainingList={trainingList}
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
        subSectionData={subSectionsData}
        refetchSubSectionsData={refetchSubSectionsData}
      ></ToolBar>
    </div>
  );
};
