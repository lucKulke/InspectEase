import React, { useEffect, useState } from "react";
import {
  Home,
  Hammer,
  Search,
  PlusCircle,
  User,
  Blocks,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNotification } from "@/app/context/NotificationContext";
import { createNewMainSection, createNewSubSection } from "../actions";
import { UUID } from "crypto";
import {
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionInsert,
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { Button } from "@/components/ui/button";
import {
  CreateCheckboxDialog,
  CreateMainSectionDialog,
  CreateSubSectionDialog,
  CreateTextInputFieldDialog,
} from "./Dialogs";
import { scrollToSection } from "@/utils/general";

interface ToolBarProps {
  setSideBarData: React.Dispatch<
    React.SetStateAction<
      IInspectableObjectInspectionFormMainSectionWithSubSection[]
    >
  >;
  sideBarData: IInspectableObjectInspectionFormMainSectionWithSubSection[];
  subSectionData: Record<
    UUID,
    IInspectableObjectInspectionFormSubSectionWithData
  >;
  setSubSectionsData: React.Dispatch<
    React.SetStateAction<
      Record<UUID, IInspectableObjectInspectionFormSubSectionWithData>
    >
  >;
  formId: UUID;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  refetchSubSectionsData: () => Promise<void>;
}

export const ToolBar = ({
  formId,
  activeTab,
  setActiveTab,
  sideBarData,
  setSideBarData,
  subSectionData,
  setSubSectionsData,
  refetchSubSectionsData,
}: ToolBarProps) => {
  const { showNotification } = useNotification();

  const toggleTab = () => {
    setActiveTab((prevTab) => (prevTab === "Editor" ? "Document" : "Editor"));
  };
  const [openCreateMainSectionDialog, setOpenCreateMainSectionDialog] =
    useState<boolean>(false);
  const [openCreateSubSectionDialog, setOpenCreateSubSectionDialog] =
    useState<boolean>(false);
  const [openCreateCheckboxDialog, setOpenCreateCheckboxDialog] =
    useState<boolean>(false);
  const [openCreateTextInputFieldDialog, setOpenCreateTextInputFieldDialog] =
    useState<boolean>(false);

  const [lastCreatedSectionId, setLastCreatedSectionId] = useState<string>("");

  useEffect(() => {
    if (!openCreateMainSectionDialog) {
      scrollToSection(lastCreatedSectionId as UUID);
      setLastCreatedSectionId("");
    }
  }, [openCreateMainSectionDialog]);

  useEffect(() => {
    if (!openCreateSubSectionDialog) {
      scrollToSection(lastCreatedSectionId as UUID);
      setLastCreatedSectionId("");
    }
  }, [openCreateSubSectionDialog]);

  const handleCreateMainSection = async (name: string, description: string) => {
    const {
      inspectableObjectInspectionFormMainSection,
      inspectableObjectInspectionFormMainSectionError,
    } = await createNewMainSection({
      name: name,
      description: description,
      form_id: formId,
      order_number: sideBarData.length + 1,
    });

    if (inspectableObjectInspectionFormMainSectionError) {
      showNotification(
        "Create main section",
        `Error: ${inspectableObjectInspectionFormMainSectionError.message} (${inspectableObjectInspectionFormMainSectionError.code})`,
        "error"
      );
    } else if (inspectableObjectInspectionFormMainSection) {
      const newMainSubSection: IInspectableObjectInspectionFormMainSectionWithSubSection =
        {
          id: inspectableObjectInspectionFormMainSection.id,
          name: inspectableObjectInspectionFormMainSection.name,
          description: inspectableObjectInspectionFormMainSection.description,
          created_at: inspectableObjectInspectionFormMainSection.created_at,
          order_number: sideBarData.length + 1,
          inspectable_object_inspection_form_sub_section: [],
          form_id: inspectableObjectInspectionFormMainSection.form_id,
        };

      setSideBarData((prev) => [...prev, newMainSubSection]);
      showNotification(
        "Create main section",
        `Successfully created new main section with id '${inspectableObjectInspectionFormMainSection.id}'`,
        "info"
      );
      setLastCreatedSectionId(inspectableObjectInspectionFormMainSection.id);
    }
  };

  const handleCreateSubSection = async (
    newSubSection: IInspectableObjectInspectionFormSubSectionInsert
  ) => {
    const {
      inspectableObjectInspectionFormSubSection,
      inspectableObjectInspectionFormSubSectionError,
    } = await createNewSubSection(newSubSection);

    if (inspectableObjectInspectionFormSubSectionError) {
      showNotification(
        "Create sub section",
        `Error: ${inspectableObjectInspectionFormSubSectionError.message} (${inspectableObjectInspectionFormSubSectionError.code})`,
        "error"
      );
    } else if (inspectableObjectInspectionFormSubSection) {
      const copyOfMainSubSections: IInspectableObjectInspectionFormMainSectionWithSubSection[] =
        [...sideBarData];

      for (let i = 0; i < copyOfMainSubSections.length; i++) {
        const mainWithSubSections = copyOfMainSubSections[i];
        if (
          mainWithSubSections.id ===
          inspectableObjectInspectionFormSubSection.main_section_id
        ) {
          mainWithSubSections.inspectable_object_inspection_form_sub_section.push(
            inspectableObjectInspectionFormSubSection
          );
          break;
        }
      }

      setSubSectionsData((prev) => {
        const copy = { ...prev };

        copy[inspectableObjectInspectionFormSubSection.id] =
          inspectableObjectInspectionFormSubSection;

        return copy;
      });

      setSideBarData(copyOfMainSubSections);
      showNotification(
        "Create sub section",
        `Successfully created new sub section with id'${inspectableObjectInspectionFormSubSection.id}'`,
        "info"
      );
      setLastCreatedSectionId(inspectableObjectInspectionFormSubSection.id);
    }
  };
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white shadow-lg px-6 py-3 rounded-2xl border border-gray-200">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="p-2 text-gray-600 hover:text-black transition">
            <Hammer size={24} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="top" className="mb-2">
          <DropdownMenuItem
            onClick={() => setOpenCreateMainSectionDialog(true)}
          >
            Main Section
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenCreateSubSectionDialog(true)}>
            Sub Section
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenCreateCheckboxDialog(true)}>
            Checkbox
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenCreateTextInputFieldDialog(true)}
          >
            Text input
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AnimatePresence mode="wait">
        <motion.ul
          key={activeTab} // Ensures re-animation on change
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center bg-gray-200 rounded-full p-2 shadow-lg">
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
      <CreateMainSectionDialog
        open={openCreateMainSectionDialog}
        setOpen={setOpenCreateMainSectionDialog}
        create={handleCreateMainSection}
      />
      <CreateSubSectionDialog
        open={openCreateSubSectionDialog}
        setOpen={setOpenCreateSubSectionDialog}
        create={handleCreateSubSection}
        sections={sideBarData}
      />

      <CreateCheckboxDialog
        refetchSubSectionsData={refetchSubSectionsData}
        open={openCreateCheckboxDialog}
        setOpen={setOpenCreateCheckboxDialog}
        sections={sideBarData}
      ></CreateCheckboxDialog>
      <CreateTextInputFieldDialog
        refetchSubSectionsData={refetchSubSectionsData}
        open={openCreateTextInputFieldDialog}
        setOpen={setOpenCreateTextInputFieldDialog}
        sectionsData={subSectionData}
        sideBarData={sideBarData}
      ></CreateTextInputFieldDialog>
    </div>
  );
};
