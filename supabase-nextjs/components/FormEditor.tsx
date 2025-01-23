"use client";
import React, { useEffect, useState } from "react";
import FormEditorSideBar from "./FormEditorSideBar";
import {
  FieldGroup,
  MainSection,
  Task,
  Field,
  Training,
  SubSection,
} from "@/lib/interfaces";
import { X, Text } from "lucide-react";
import { difference } from "next/dist/build/utils";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { DBActions } from "@/lib/dbActions";
interface FormEditorProps {
  inspectionPlanId: string;
}

// const mainSections: MainSection[] = [
//   {
//     id: "1",
//     name: "Elektrik und elektronische Fahrzeugsysteme",
//   },

//   {
//     id: "2",
//     name: "Fahrzeug von außen",
//   },
//   {
//     id: "3",
//     name: "Bereifung",
//   },
// ];

const subSections: SubSection[] = [
  { id: "22", name: "Batterie", main_section_id: "1" },
  { id: "45", name: "Reifenart", main_section_id: "3" },
];

const tasks: Task[] = [
  {
    id: "324234",
    description: "Batterie ladezutand prüfen",
    field_group_id: "3334",
  },
  {
    id: "324235",
    description: "Batterie zustand prüfen",
    field_group_id: "3334",
  },
];

const fieldGroups: FieldGroup[] = [
  { id: "3334", type: "crossGroup", sub_section_id: "22" },
  { id: "3335", type: "text", sub_section_id: "22" },
  { id: "3336", type: "cross", sub_section_id: "45" },
];

const fields: Field[] = [
  {
    id: "234",
    field_group_id: "3334",
    description: "in ordnung",
    training_id: null,
  },
  {
    id: "235",
    field_group_id: "3334",
    description: "nicht in ordnung",
    training_id: null,
  },
  {
    id: "237",
    field_group_id: "3334",
    description: "behoben",
    training_id: null,
  },
  {
    id: "238",
    field_group_id: "3335",
    description: "Batterie zustand in V",
    training_id: null,
  },

  {
    id: "239",
    field_group_id: "3336",
    description: "fährt Winterreifen",
    training_id: null,
  },
];

const training: Training[] = [
  {
    id: "23",
    field_id: "238",
    raw: "Der Ladezustand ist bei ca 12.4 V",
    extracted_string: "12.4",
  },
];

const FormEditor = ({ inspectionPlanId }: FormEditorProps) => {
  const supabase = createClient();
  const dbActions = new DBActions(supabase);
  const [mainSections, setMainSections] = useState<MainSection[]>([]);
  const [subSections, setSubSections] = useState<SubSection[]>([]);

  const fetchMainSections = async () => {
    const { data, error } = await dbActions.inspectionPlanFormFetchMainSection(
      inspectionPlanId
    );
    setMainSections(data);
  };

  const fetchSubSection = async () => {
    const { data, error } = await dbActions.inspectionPlanFormFetchSubSection(
      inspectionPlanId
    );
    setSubSections(data);
  };

  useEffect(() => {
    fetchMainSections();
    fetchSubSection();
  }, []);

  const fieldGroupTypes: Record<string, any> = {
    crossGroup: (
      <div className="flex">
        ( <X /> <X />)
      </div>
    ),
    cross: <X />,
    text: <Text />,
  };

  const createMainSection = async (sectionName: string) => {
    const { data, error } = await dbActions.inspectionPlanFormCreateMainSection(
      { name: sectionName, inspection_plan_id: inspectionPlanId }
    );
    console.log(data);
    setMainSections([...mainSections, data[0]]);
  };

  const createSubSection = async (
    sectionName: string,
    mainSectionId: string
  ) => {
    const { data, error } = await dbActions.inspectionPlanFormCreateSubSection({
      name: sectionName,
      main_section_id: mainSectionId,
      inspection_plan_id: inspectionPlanId,
    });
    console.log(data);
    setSubSections([...subSections, data[0]]);
  };

  const deleteSubSection = async (subSectionId: string) => {
    console.log("deleting sub section", subSectionId);
    const { data, error } = await dbActions.inspectionPlanFormDeleteSubSection(
      subSectionId
    );
    setSubSections((prev) =>
      subSections.filter((subSection) => {
        return subSection.id !== subSectionId;
      })
    );
  };
  const deleteMainSection = async (mainSectionId: string) => {
    console.log("deleting main section", mainSectionId);
    const { data, error } = await dbActions.inspectionPlanFormDeleteMainSection(
      mainSectionId
    );

    setMainSections((prev) =>
      mainSections.filter((mainSection) => {
        return mainSection.id !== mainSectionId;
      })
    );

    const subSectionsCopy = [...subSections];
    subSectionsCopy.forEach(async (subSection) => {
      if (subSection.main_section_id === mainSectionId) {
        await deleteSubSection(subSection.id);
      }
    });
  };

  return (
    <div className="border-2 rounded-xl flex min-h-screen">
      <FormEditorSideBar
        createMainSection={createMainSection}
        createSubSection={createSubSection}
        mainSections={mainSections}
        subSections={subSections}
        deleteSubSection={deleteSubSection}
        deleteMainSection={deleteMainSection}
      ></FormEditorSideBar>

      <div className="p-8 w-full">
        <ul>
          {mainSections.map((mainSection) => (
            <li key={mainSection.id}>
              <h2 className="underline font-bold">{mainSection.name}</h2>
              <div className="border-2 rounded-xl p-4">
                <ul>
                  {subSections
                    .filter((subSection) => {
                      return subSection.main_section_id === mainSection.id;
                    })
                    .map((subSection) => (
                      <li key={subSection.id}>
                        <h2>{subSection.name}</h2>
                        <ul className="space-y-3">
                          {fieldGroups
                            .filter((group) => {
                              return group.sub_section_id === subSection.id;
                            })
                            .map((fieldGroup) => (
                              <li
                                key={fieldGroup.id}
                                className="border-2 rounded-xl p-2"
                              >
                                <div>{fieldGroupTypes[fieldGroup.type]}</div>
                                <div className="flex">
                                  <ul>
                                    {fields
                                      .filter((field) => {
                                        return (
                                          field.field_group_id === fieldGroup.id
                                        );
                                      })
                                      .map((field) => (
                                        <li key={field.id}>
                                          <p>{field.description}</p>
                                          {fieldGroup.type === "text" && (
                                            <Link
                                              className="text-blue-600"
                                              href={
                                                "/studio/inspection_plan/" +
                                                inspectionPlanId +
                                                "/field/" +
                                                field.id
                                              }
                                            >
                                              Training
                                            </Link>
                                          )}
                                        </li>
                                      ))}
                                  </ul>
                                  <ul>
                                    {tasks
                                      .filter((task) => {
                                        return (
                                          task.field_group_id === fieldGroup.id
                                        );
                                      })
                                      .map((task) => (
                                        <li key={task.id} className="ml-24">
                                          {task.description}
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </li>
                    ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FormEditor;
