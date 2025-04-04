"use client";
import {
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionWithData,
  IStringExtractionTrainingResponse,
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
import {
  CheckboxGroupDialog,
  TaskDialog,
  TextInputFieldsDialog,
} from "./Dialogs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { deleteAllTextInputFields, deleteCheckboxGroup } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

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
  trainingList: IStringExtractionTrainingResponse[] | undefined;
}

export const MainContent = ({
  mainSubSections,
  subSectionsData,
  setSubSectionsData,
  trainingList,
}: MainContentProps) => {
  const { showNotification } = useNotification();
  const [openDeleteAllTasksDialog, setOpenDeleteAllTasksDialog] =
    useState<boolean>(false);
  const [openTaskDialog, setOpenTaskDialog] = useState<boolean>(false);
  const [openCheckboxGroupDialog, setOpenCheckboxGroupDialog] =
    useState<boolean>(false);
  const [openTextInputFieldDialog, setOpenTextInputFieldDialog] =
    useState<boolean>(false);

  useEffect(() => {
    "changed " + openTextInputFieldDialog;
  }, [openTextInputFieldDialog]);

  const [selectedCheckboxGroupId, setSelectedCheckboxGroupId] =
    useState<UUID>();

  const [selectedSubSectionId, setSelectedSubSectionId] = useState<UUID>();

  const handleDelteCheckboxGroup = async (
    groupId: UUID,
    subSectionId: UUID
  ) => {
    const { deletedFormCheckboxGroup, deletedFormCheckboxGroupError } =
      await deleteCheckboxGroup(groupId);

    if (deletedFormCheckboxGroupError) {
      showNotification(
        "Delte checkbox group",
        `Error: ${deletedFormCheckboxGroupError.message} (${deletedFormCheckboxGroupError.code})`,
        "error"
      );
    } else if (deletedFormCheckboxGroup) {
      const copy = { ...subSectionsData };
      copy[subSectionId].form_checkbox_group = copy[
        subSectionId
      ].form_checkbox_group.filter((group) => group.id !== groupId);

      setSubSectionsData(copy);
      showNotification(
        "Delte checkbox group",
        `Successfully deleted checkbox group '${groupId}'`,
        "info"
      );
    }
  };

  const handleDeleteAllTextInputFields = async (subSectionId: UUID) => {
    const { deletedFormTextInputFields, deletedFormTextInputFieldsError } =
      await deleteAllTextInputFields(subSectionId);
    if (deletedFormTextInputFieldsError) {
      showNotification(
        "Delte text input fields",
        `Error: ${deletedFormTextInputFieldsError.message} (${deletedFormTextInputFieldsError.code})`,
        "error"
      );
    } else if (deletedFormTextInputFields) {
      const copy = { ...subSectionsData };
      copy[subSectionId].form_checkbox_group = copy[
        subSectionId
      ].form_text_input_field = [];

      setSubSectionsData(copy);
      showNotification(
        "Delte text input fields",
        `Successfully deleted all text input fields for sub section '${subSectionId}'`,
        "info"
      );
    }
  };

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
                        setOpenTextInputFieldDialog={
                          setOpenTextInputFieldDialog
                        }
                        handleDelteCheckboxGroup={handleDelteCheckboxGroup}
                        handleDeleteAllTextInputFields={
                          handleDeleteAllTextInputFields
                        }
                        setSelectedCheckboxGroupId={setSelectedCheckboxGroupId}
                        setSelectedSubSectionId={setSelectedSubSectionId}
                        trainingList={trainingList}
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
      {selectedSubSectionId && (
        <TextInputFieldsDialog
          setOpen={setOpenTextInputFieldDialog}
          open={openTextInputFieldDialog}
          setSubSectionsData={setSubSectionsData}
          subSectionsData={subSectionsData}
          subSectionId={selectedSubSectionId}
          trainingList={trainingList}
        />
      )}
    </div>
  );
};
