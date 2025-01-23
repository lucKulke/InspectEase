"use client";
import React from "react";
import FormEditorSideBar from "./FormEditorSideBar";
import {
  FieldGroup,
  SectionName,
  Task,
  Field,
  Training,
} from "@/lib/interfaces";
import { X, Text } from "lucide-react";
import { difference } from "next/dist/build/utils";
import Link from "next/link";
interface FormEditorProps {
  inspectionPlanId: string;
}

const FormEditor = ({ inspectionPlanId }: FormEditorProps) => {
  const fieldGroupTypes: Record<string, any> = {
    crossGroup: (
      <div className="flex">
        ( <X /> <X />)
      </div>
    ),
    cross: <X />,
    text: <Text />,
  };

  const sectionNames: SectionName[] = [
    {
      id: "1",
      name: "Elektrik und elektronische Fahrzeugsysteme",
      groupNames: [
        { id: "22", name: "Batterie" },
        { id: "23", name: "Frontbeleuchtung" },
      ],
    },

    {
      id: "2",
      name: "Fahrzeug von außen",
      groupNames: [
        { id: "33", name: "Scheibenwisch-/Waschanlage" },
        { id: "34", name: "Scheibwischerblätter" },
      ],
    },
    {
      id: "3",
      name: "Bereifung",
      groupNames: [
        { id: "44", name: "Reifendruck" },
        { id: "45", name: "Reifenart" },
      ],
    },
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
    { id: "3334", type: "crossGroup", group_id: "22" },
    { id: "3335", type: "text", group_id: "22" },
    { id: "3336", type: "cross", group_id: "45" },
  ];

  const fields: Field[] = [
    {
      id: "234",
      field_group_id: "3334",
      name: "in ordnung",
      training_id: null,
    },
    {
      id: "235",
      field_group_id: "3334",
      name: "nicht in ordnung",
      training_id: null,
    },
    {
      id: "237",
      field_group_id: "3334",
      name: "behoben",
      training_id: null,
    },
    {
      id: "238",
      field_group_id: "3335",
      name: "Batterie zustand in V",
      training_id: null,
    },

    {
      id: "239",
      field_group_id: "3336",
      name: "fährt Winterreifen",
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

  return (
    <div className="border-2 rounded-xl flex min-h-screen">
      <FormEditorSideBar sectionNames={sectionNames}></FormEditorSideBar>

      <div className="p-8 w-full">
        <ul>
          {sectionNames.map((section) => (
            <li key={section.id}>
              <h2 className="underline font-bold">{section.name}</h2>
              <div className="border-2 rounded-xl p-4">
                <ul>
                  {section.groupNames.map((groupName) => (
                    <li key={groupName.id}>
                      <h2>{groupName.name}</h2>
                      <ul className="space-y-3">
                        {fieldGroups
                          .filter((group) => {
                            return group.group_id === groupName.id;
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
                                        <p>{field.name}</p>
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
