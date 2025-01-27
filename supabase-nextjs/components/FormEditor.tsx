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
  DBSelectAnnotationData,
} from "@/lib/interfaces";
import { X, Text, Ellipsis, Trash2 } from "lucide-react";
import { difference } from "next/dist/build/utils";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { DBActions } from "@/lib/dbActions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import FieldContainer from "./FieldContainer";
import { redirect } from "next/navigation";
interface FormEditorProps {
  inspectionPlanId: string;
}

const FormEditor = ({ inspectionPlanId }: FormEditorProps) => {
  const supabase = createClient();
  const dbActions = new DBActions(supabase);
  const [mainSections, setMainSections] = useState<MainSection[]>([]);
  const [subSections, setSubSections] = useState<SubSection[]>([]);
  const [fieldGroups, setFieldGroups] = useState<FieldGroup[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [annotations, setAnnotations] = useState<DBSelectAnnotationData[]>([]);
  const [openAddField, setOpenAddField] = useState<boolean>(false);
  const [openAddTask, setOpenAddTask] = useState<boolean>(false);
  const [newFieldDescription, setNewFieldDescription] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [selectedAnntation, setSelectedAnnotation] = useState<string>("");
  const [currentFieldGroupId, setCurrentFieldGroupId] = useState<string>("");

  const fetchMainSections = async () => {
    const { mainSections, mainSectionErrors } =
      await dbActions.inspectionPlanFormFetchMainSection(inspectionPlanId);
    setMainSections(mainSections);
  };

  const fetchSubSection = async () => {
    const { subSections, subSectionsError } =
      await dbActions.inspectionPlanFormFetchSubSection(inspectionPlanId);
    setSubSections(subSections);
  };

  const fetchFieldGroups = async () => {
    const { data, error } = await dbActions.inspectionPlanFormFetchFieldGroup(
      inspectionPlanId
    );
    setFieldGroups(data);
  };

  const fetchFields = async () => {
    const { fields, fieldsError } =
      await dbActions.inspectionPlanFormFetchFields(inspectionPlanId);
    setFields(fields);
  };

  const fetchTasks = async () => {
    const { data, error } = await dbActions.inspectionPlanFormFetchTask(
      inspectionPlanId
    );
    setTasks(data);
  };

  const fetchAnnotations = async () => {
    const { annotations, annotationsError } =
      await dbActions.inspectionPlanFormFetchAnnotation(inspectionPlanId);
    setAnnotations(annotations);
    console.log(annotations);
  };

  useEffect(() => {
    fetchMainSections();
    fetchSubSection();
    fetchFieldGroups();
    fetchFields();
    fetchTasks();
    fetchAnnotations();
  }, []);

  useEffect(() => {
    if (!openAddField) {
      setSelectedAnnotation("");
      setNewFieldDescription("");
    }
  }, [openAddField]);

  useEffect(() => {
    if (!openAddTask) {
      setNewTaskDescription("");
    }
  }, [openAddTask]);

  const fieldGroupTypes: Record<string, any> = {
    multiCross: (
      <div className="flex">
        ( <X /> <X />)
      </div>
    ),
    singleCross: <X />,
    singleText: <Text />,
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

  const createFieldGroup = async (type: string, subSectionId: string) => {
    const { data, error } = await dbActions.inspectionPlanFormCreateFieldGroup({
      type: type,
      sub_section_id: subSectionId,
      inspection_plan_id: inspectionPlanId,
    });
    console.log(data);
    setFieldGroups([...fieldGroups, data[0]]);
  };

  const deleteFieldGroup = async (fieldGroupId: string) => {
    console.log("deleting field group", fieldGroupId);
    const { data, error } = await dbActions.inspectionPlanFormDeleteFieldGroup(
      fieldGroupId
    );

    setFieldGroups(
      fieldGroups.filter((fieldGroup) => {
        return fieldGroup.id !== fieldGroupId;
      })
    );
  };

  const createField = async (
    fieldGroupId: string,
    description: string,
    annotation_id: string
  ) => {
    const { data, error } = await dbActions.inspectionPlanFormCreateField({
      field_group_id: fieldGroupId,
      description: description,
      inspection_plan_id: inspectionPlanId,
      annotation_id: annotation_id,
    });
    console.log(data);
    setFields([...fields, data[0]]);
    setOpenAddField(false);
    setNewFieldDescription("");
    setSelectedAnnotation("");
  };

  const deleteField = async (fieldId: string) => {
    console.log("deleting field", fieldId);
    const { data, error } = await dbActions.inspectionPlanFormDeleteField(
      fieldId
    );

    setFields(
      fields.filter((field) => {
        return field.id !== fieldId;
      })
    );
  };

  const createTask = async (fieldGroupId: string, description: string) => {
    const { data, error } = await dbActions.inspectionPlanFormCreateTask({
      field_group_id: fieldGroupId,
      description: description,
      inspection_plan_id: inspectionPlanId,
    });
    console.log(data);
    setTasks([...tasks, data[0]]);
    setOpenAddTask(false);
  };

  const deleteTask = async (taskId: string) => {
    console.log("deleting task", taskId);
    const { data, error } = await dbActions.inspectionPlanFormDeleteTask(
      taskId
    );

    setTasks(
      tasks.filter((task) => {
        return task.id !== taskId;
      })
    );
  };

  const filterFreeAnnotations = (
    annos: DBSelectAnnotationData[]
  ): DBSelectAnnotationData[] => {
    const annosCopy = [...annos];
    const fieldsCopy = [...fields];
    const filteredAnnotations = annosCopy.filter((annotation) => {
      let isAllreadyUsed = true;
      fieldsCopy.forEach((field) => {
        if (field.annotation_id === annotation.id) {
          isAllreadyUsed = false;
        }
      });
      return isAllreadyUsed;
    });

    return filteredAnnotations;
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
            <li id={mainSection.id} key={mainSection.id}>
              <h2 className="underline font-bold">{mainSection.name}</h2>
              <div className="border-2 rounded-xl p-4">
                <ul>
                  {subSections
                    .filter((subSection) => {
                      return subSection.main_section_id === mainSection.id;
                    })
                    .map((subSection) => (
                      <li id={subSection.id} key={subSection.id}>
                        <div className="flex space-x-2 group">
                          <h2 className="hover:cursor-pointer">
                            {subSection.name}
                          </h2>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger>
                              <Ellipsis className="text-slate-500 opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-200"></Ellipsis>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() =>
                                  createFieldGroup("multiCross", subSection.id)
                                }
                              >
                                Add multi cross
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  createFieldGroup("singleCross", subSection.id)
                                }
                              >
                                Add single cross
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  createFieldGroup("singleText", subSection.id)
                                }
                              >
                                Add text
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onSelect={() => {}}
                              >
                                delete <Trash2></Trash2>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <ul className="space-y-3">
                          {fieldGroups
                            .filter((group) => {
                              return group.sub_section_id === subSection.id;
                            })
                            .map((fieldGroup) => (
                              <li
                                key={fieldGroup.id}
                                className="border-2 rounded-xl p-2 "
                              >
                                <div className="flex justify-between ">
                                  <div className="flex space-x-2 group">
                                    <div>
                                      {fieldGroupTypes[fieldGroup.type]}
                                    </div>
                                    <DropdownMenu modal={false}>
                                      <DropdownMenuTrigger>
                                        <Ellipsis className="text-slate-500 opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-200"></Ellipsis>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuLabel>
                                          Actions
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onSelect={() => {
                                            setCurrentFieldGroupId(
                                              fieldGroup.id
                                            );
                                            setOpenAddField(true);
                                          }}
                                        >
                                          Add field
                                        </DropdownMenuItem>

                                        {fieldGroup.type === "multiCross" && (
                                          <DropdownMenuItem
                                            onSelect={() => {
                                              setCurrentFieldGroupId(
                                                fieldGroup.id
                                              );
                                              setOpenAddTask(true);
                                            }}
                                          >
                                            Add task
                                          </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem
                                          className="text-red-600"
                                          onSelect={() =>
                                            deleteFieldGroup(fieldGroup.id)
                                          }
                                        >
                                          delete <Trash2></Trash2>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                <div className="flex">
                                  <ul className="space-y-3 mt-2 ">
                                    {fields
                                      .filter((field) => {
                                        return (
                                          field.field_group_id === fieldGroup.id
                                        );
                                      })
                                      .map((field) => (
                                        <li key={field.id} className="">
                                          <div className="flex items-center space-x-2 group">
                                            <FieldContainer
                                              fieldDescription={
                                                field.description
                                              }
                                              fieldId={
                                                annotations.filter(
                                                  (annotation) => {
                                                    return (
                                                      annotation.id ===
                                                      field.annotation_id
                                                    );
                                                  }
                                                )[0]?.field_id
                                              }
                                            ></FieldContainer>

                                            <DropdownMenu modal={false}>
                                              <DropdownMenuTrigger>
                                                <Ellipsis className="text-slate-500 opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-200"></Ellipsis>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent>
                                                <DropdownMenuLabel>
                                                  Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {fieldGroup.type ===
                                                  "singleText" && (
                                                  <DropdownMenuItem>
                                                    <Link
                                                      href={
                                                        "/studio/inspection_plan/" +
                                                        inspectionPlanId +
                                                        "/field_training/" +
                                                        field.id
                                                      }
                                                    >
                                                      Training
                                                    </Link>
                                                  </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                  className="text-red-600"
                                                  onSelect={() =>
                                                    deleteField(field.id)
                                                  }
                                                >
                                                  delete <Trash2></Trash2>
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </li>
                                      ))}
                                  </ul>
                                  {fieldGroup.type === "multiCross" && (
                                    <ul>
                                      {tasks
                                        .filter((task) => {
                                          return (
                                            task.field_group_id ===
                                            fieldGroup.id
                                          );
                                        })
                                        .map((task) => (
                                          <li key={task.id} className="ml-24">
                                            <div className="group flex space-x-2">
                                              <p>- {task.description}</p>
                                              <DropdownMenu modal={false}>
                                                <DropdownMenuTrigger>
                                                  <Ellipsis className="text-slate-500 opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-200"></Ellipsis>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                  <DropdownMenuLabel>
                                                    Actions
                                                  </DropdownMenuLabel>
                                                  <DropdownMenuSeparator />

                                                  <DropdownMenuItem
                                                    className="text-red-600"
                                                    onSelect={() =>
                                                      deleteTask(task.id)
                                                    }
                                                  >
                                                    delete <Trash2></Trash2>
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            </div>
                                          </li>
                                        ))}
                                    </ul>
                                  )}
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

      <Dialog open={openAddField} onOpenChange={setOpenAddField}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add new field</DialogTitle>
            <DialogDescription>add new field</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newFieldDescription" className="text-right">
                Description
              </Label>
              <Input
                id="newFieldDescription"
                value={newFieldDescription} // Controlled input
                onChange={(e) => setNewFieldDescription(e.target.value)} // Update state on input change
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fieldId" className="text-right">
                ID
              </Label>
              <Select
                onValueChange={(slectedValue) =>
                  setSelectedAnnotation(slectedValue)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent id="fieldId">
                  <SelectGroup>
                    <SelectLabel>Field ID</SelectLabel>
                    {filterFreeAnnotations(annotations).map((annotation) => (
                      <SelectItem key={annotation.id} value={annotation.id}>
                        {annotation.field_id}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            {selectedAnntation.length > 0 && newFieldDescription.length > 3 ? (
              <Button
                onClick={() =>
                  createField(
                    currentFieldGroupId,
                    newFieldDescription,
                    selectedAnntation
                  )
                }
              >
                Save changes
              </Button>
            ) : (
              <Button disabled variant="outline">
                Save changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openAddTask} onOpenChange={setOpenAddTask}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add new task</DialogTitle>
            <DialogDescription>add new task</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newTaskDescription" className="text-right">
                Description
              </Label>
              <Input
                id="newTaskDescription"
                value={newTaskDescription} // Controlled input
                onChange={(e) => setNewTaskDescription(e.target.value)} // Update state on input change
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            {newTaskDescription.length > 3 ? (
              <Button
                onClick={() =>
                  createTask(currentFieldGroupId, newTaskDescription)
                }
              >
                Save changes
              </Button>
            ) : (
              <Button disabled variant="outline">
                Save changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormEditor;
