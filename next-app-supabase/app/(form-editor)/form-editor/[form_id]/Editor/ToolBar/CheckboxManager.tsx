"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IFormCheckboxGroupInsert,
  IFormCheckboxGroupInsertWithId,
  IFormCheckboxInsert,
  IFormCheckboxInsertWithId,
  IInspectableObjectInspectionFormMainSectionWithSubSection,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { Reorder } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { group } from "console";
import { UUID } from "crypto";
import { createFormCheckboxes, createFromCheckboxGroups } from "../actions";
import { SupabaseError } from "@/lib/globalInterfaces";
import { useNotification } from "@/app/context/NotificationContext";
import { scrollToSection } from "@/utils/general";

interface CheckboxItem {
  id: string;
  label: string;
  order_number: number;
  group_id: string | null;
}

interface SelectionGroup {
  id: string;
  name: string;
  checkboxIds: string[];
  subSectionIds: string[];
}

interface CheckboxManagerProps {
  sections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetchSubSectionsData: () => Promise<void>;
}

export const CheckboxManager = ({
  sections,
  setOpen,
  refetchSubSectionsData,
}: CheckboxManagerProps) => {
  const { showNotification } = useNotification();
  const [checkboxes, setCheckboxes] = useState<CheckboxItem[]>([]);
  const [groups, setGroups] = useState<SelectionGroup[]>([]);
  const [newCheckboxLabel, setNewCheckboxLabel] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [atLeastOneSubSectionSelected, setAtLeastOneSubSectionSelected] =
    useState<boolean>(false);
  const [assignedSubSections, setAssignedSubSections] = useState<
    Record<string, string[]>
  >({});

  // groupid: [checkboxId, checkboxId]
  const [rules, setRules] = useState<Record<string, string[]>>({});

  // Create a new checkbox
  const handleCreateCheckbox = () => {
    if (!newCheckboxLabel.trim()) return;

    const newCheckbox: CheckboxItem = {
      id: uuidv4(),
      label: newCheckboxLabel,
      order_number: checkboxes.length + 1,
      group_id: null,
    };

    setCheckboxes([...checkboxes, newCheckbox]);
    setNewCheckboxLabel("");
  };

  // Create a new selection group
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: SelectionGroup = {
      id: uuidv4(),
      name: newGroupName,
      checkboxIds: [],
      subSectionIds: [],
    };

    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setSelectedGroupId(newGroup.id);
  };

  // Delete a checkbox
  const handleDeleteCheckbox = (id: string) => {
    setCheckboxes(checkboxes.filter((checkbox) => checkbox.id !== id));

    // Remove the checkbox from any groups it's in
    setGroups(
      groups.map((group) => ({
        ...group,
        checkboxIds: group.checkboxIds.filter(
          (checkboxId) => checkboxId !== id
        ),
      }))
    );
  };

  // Delete a group
  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter((group) => group.id !== id));
    if (selectedGroupId === id) {
      setSelectedGroupId(null);
    }
  };

  // Toggle a checkbox in a group
  const toggleCheckboxInGroup = (checkboxId: string) => {
    if (!selectedGroupId) return;

    setCheckboxes(
      checkboxes.map((checkbox) => {
        if (checkboxId === checkbox.id) {
          checkbox.group_id = selectedGroupId;
        }
        return checkbox;
      })
    );

    setGroups(
      groups.map((group) => {
        if (group.id === selectedGroupId) {
          const isInGroup = group.checkboxIds.includes(checkboxId);
          return {
            ...group,
            checkboxIds: isInGroup
              ? group.checkboxIds.filter((id) => id !== checkboxId)
              : [...group.checkboxIds, checkboxId],
          };
        }
        return group;
      })
    );
  };

  const anySubSectionsSelected = (
    record: Record<string, string[]>
  ): boolean => {
    let foundSelectedSubSection = false;
    Object.entries(record).forEach(([subSectionId, groupIdList]) => {
      if (groupIdList.length > 0) foundSelectedSubSection = true;
    });
    return foundSelectedSubSection;
  };

  // Toggle a checkbox in a assigned sub sections
  const toggleSelectionGroupsInSubSections = (subSectionId: string) => {
    if (!selectedGroupId) return;

    const copyOfAssignedSubSections = { ...assignedSubSections };

    setGroups(
      groups.map((group) => {
        if (
          selectedGroupId === group.id &&
          !group.subSectionIds.includes(subSectionId)
        ) {
          group.subSectionIds.push(subSectionId);
        }
        return group;
      })
    );

    const currentGroupIdList = copyOfAssignedSubSections[subSectionId];
    if (currentGroupIdList) {
      if (currentGroupIdList.includes(selectedGroupId)) {
        copyOfAssignedSubSections[subSectionId] = currentGroupIdList.filter(
          (groupId) => groupId !== selectedGroupId
        );
        if (copyOfAssignedSubSections[subSectionId].length === 0) {
          delete copyOfAssignedSubSections[subSectionId];
        }
      } else {
        copyOfAssignedSubSections[subSectionId].push(selectedGroupId);
      }
    } else {
      copyOfAssignedSubSections[subSectionId] = [selectedGroupId];
    }

    if (anySubSectionsSelected(copyOfAssignedSubSections)) {
      setAtLeastOneSubSectionSelected(true);
    } else {
      setAtLeastOneSubSectionSelected(false);
    }

    setAssignedSubSections(copyOfAssignedSubSections);
    console.log("groups", groups);
    console.log("assigned sub sections", copyOfAssignedSubSections);
  };

  // Get checkboxes for a specific group
  const getCheckboxesForGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return [];

    return checkboxes.filter((checkbox) =>
      group.checkboxIds.includes(checkbox.id)
    );
  };

  const reorderItems = (newOrder: CheckboxItem[]) => {
    return newOrder.map((item, index) => ({
      ...item,
      order_number: index + 1,
    }));
  };

  const handleCheckboxesReorder = (newOrder: CheckboxItem[]) => {
    const unchangedCheckboxes = checkboxes.filter(
      (checkbox) => !newOrder.includes(checkbox)
    );

    const updatedItems = reorderItems(newOrder);
    setCheckboxes([...unchangedCheckboxes, ...updatedItems]);
  };

  // useEffect(() => {
  //   console.log("checkboxes", checkboxes);
  // }, [checkboxes]);

  const handleCreateCheckboxGroups = async (): Promise<{
    error: SupabaseError | null;
    id: string | null;
  }> => {
    console.log("groups", groups);

    let sampleCheckboxId: string | null = "";

    const checkboxGroupsForDB: IFormCheckboxGroupInsertWithId[] = [];
    const checkboxesForDB: IFormCheckboxInsertWithId[] = [];

    for (let outerindex = 0; outerindex < groups.length; outerindex++) {
      const group = groups[outerindex];

      for (
        let innerindex = 0;
        innerindex < group.subSectionIds.length;
        innerindex++
      ) {
        const subSectionId = group.subSectionIds[innerindex];

        const newGroupId = uuidv4() as UUID;

        const associatedCheckboxes = checkboxes.filter(
          (checkbox) => checkbox.group_id === group.id
        );

        let checkboxesThatCanBeSelectedTogether = null;
        if (rules[group.id]) {
          checkboxesThatCanBeSelectedTogether =
            rules[group.id].length > 1 ? rules[group.id] : null;
        }

        for (
          let checkboxIndex = 0;
          checkboxIndex < associatedCheckboxes.length;
          checkboxIndex++
        ) {
          const newCheckoxId = uuidv4() as UUID;
          const checkbox = associatedCheckboxes[checkboxIndex];

          if (checkboxesThatCanBeSelectedTogether) {
            if (checkboxesThatCanBeSelectedTogether.includes(checkbox.id)) {
              checkboxesThatCanBeSelectedTogether =
                checkboxesThatCanBeSelectedTogether.filter(
                  (checkboxId) => checkboxId !== checkbox.id
                );
              checkboxesThatCanBeSelectedTogether.push(newCheckoxId);
            }
          }

          const newCheckbox: IFormCheckboxInsertWithId = {
            id: newCheckoxId,
            group_id: newGroupId,
            label: checkbox.label,
            order_number: checkbox.order_number,
            annotation_id: null,
          };

          checkboxesForDB.push(newCheckbox);
        }

        const newGroup: IFormCheckboxGroupInsertWithId = {
          id: newGroupId,
          name: group.name,
          sub_section_id: subSectionId as UUID,
          checkboxes_selected_together: checkboxesThatCanBeSelectedTogether,
        };

        checkboxGroupsForDB.push(newGroup);

        sampleCheckboxId = subSectionId;
      }
    }
    const { formCheckboxGroups, formCheckboxGroupsError } =
      await createFromCheckboxGroups(checkboxGroupsForDB);

    if (formCheckboxGroupsError) {
      return { error: formCheckboxGroupsError, id: null };
    }

    const { formCheckboxes, formCheckboxesError } = await createFormCheckboxes(
      checkboxesForDB
    );

    if (formCheckboxesError) {
      return { error: formCheckboxesError, id: null };
    }
    return { error: null, id: sampleCheckboxId };
  };

  const isInRule = (checkboxId: string) => {
    return rules[selectedGroupId as string]
      ? rules[selectedGroupId as string].includes(checkboxId)
      : false;
  };

  const assignToRule = (checkboxId: string, groupId: string) => {
    const copy = { ...rules };
    if (copy[groupId]) {
      if (copy[groupId].includes(checkboxId)) {
        copy[groupId] = copy[groupId].filter(
          (checkbox) => checkbox !== checkboxId
        );
      } else {
        copy[groupId].push(checkboxId);
      }
    } else {
      copy[groupId] = [checkboxId];
    }

    setRules(copy);
  };

  return (
    <div>
      <Tabs defaultValue="create" className="mt-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="assign">Assign</TabsTrigger>
        </TabsList>

        {/* Create Tab */}
        <TabsContent value="create" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-checkbox">New Checkbox</Label>
              <div className="flex gap-2">
                <Input
                  id="new-checkbox"
                  placeholder="Enter checkbox label"
                  value={newCheckboxLabel}
                  onChange={(e) => setNewCheckboxLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateCheckbox();
                  }}
                />
                <Button onClick={handleCreateCheckbox}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Created Checkboxes</h3>
              <ScrollArea className="h-[200px] rounded-md border p-2">
                {checkboxes.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    No checkboxes created yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {checkboxes.map((checkbox) => (
                      <div
                        key={checkbox.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox id={checkbox.id} />
                          <Label htmlFor={checkbox.id}>{checkbox.label}</Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCheckbox(checkbox.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-group">New Group</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-group"
                    placeholder="Enter group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateGroup();
                    }}
                  />
                  <Button onClick={handleCreateGroup}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Selection Groups</h3>
                <ScrollArea className="h-[200px] rounded-md border p-2">
                  {groups.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">
                      No groups created yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className="flex items-center justify-between"
                        >
                          <Button
                            variant={
                              selectedGroupId === group.id
                                ? "default"
                                : "outline"
                            }
                            className="w-full justify-between"
                            onClick={() => setSelectedGroupId(group.id)}
                          >
                            <span>{group.name}</span>
                            <span className="text-xs bg-primary-foreground text-primary rounded-full px-2 py-0.5">
                              {group.checkboxIds.length}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">
                {selectedGroupId
                  ? `Assign Checkboxes to: ${
                      groups.find((g) => g.id === selectedGroupId)?.name
                    }`
                  : "Select a group to assign checkboxes"}
              </h3>
              <ScrollArea className="h-[260px] rounded-md border p-2">
                {!selectedGroupId ? (
                  <p className="text-sm text-muted-foreground p-2">
                    Select a group first.
                  </p>
                ) : checkboxes.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    No checkboxes available.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {checkboxes.map((checkbox) => {
                      const isInSelectedGroup =
                        groups
                          .find((g) => g.id === selectedGroupId)
                          ?.checkboxIds.includes(checkbox.id) || false;

                      let isInDiffrentSelectedGroup = false;
                      groups.forEach((group) => {
                        if (
                          group.id !== selectedGroupId &&
                          group.checkboxIds.includes(checkbox.id)
                        ) {
                          isInDiffrentSelectedGroup = true;
                          return;
                        }
                      });

                      return (
                        <div
                          key={checkbox.id}
                          className="flex items-center space-x-2"
                        >
                          {isInDiffrentSelectedGroup ? (
                            <Checkbox
                              id={`group-${selectedGroupId}-${checkbox.id}`}
                              checked={isInSelectedGroup}
                              disabled={true}
                            />
                          ) : (
                            <Checkbox
                              id={`group-${selectedGroupId}-${checkbox.id}`}
                              checked={isInSelectedGroup}
                              onCheckedChange={() =>
                                toggleCheckboxInGroup(checkbox.id)
                              }
                            />
                          )}

                          <Label
                            htmlFor={`group-${selectedGroupId}-${checkbox.id}`}
                          >
                            {checkbox.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="rules" className="space-y-4">
          <div className="flex space-x-4">
            <ScrollArea className="h-[260px] w-1/2 rounded-md border p-4">
              <div className="space-y-4">
                {groups.length === 0 ? (
                  <div className="col-span-full">
                    <p className="text-center text-muted-foreground py-8">
                      No groups to preview. Create some groups and add
                      checkboxes to them.
                    </p>
                  </div>
                ) : (
                  groups.map((group) => {
                    const groupCheckboxes = getCheckboxesForGroup(group.id);

                    return (
                      <Card
                        key={group.id}
                        onClick={() => setSelectedGroupId(group.id)}
                        className={` ${selectedGroupId === group.id && "dark"}`}
                      >
                        <CardHeader>
                          <CardTitle>{group.name}</CardTitle>
                          <CardDescription>
                            {groupCheckboxes.length} checkbox
                            {groupCheckboxes.length !== 1 ? "es" : ""}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {rules[group.id] && rules[group.id].length > 1 && (
                            <p className="text-sm text-gray-300">
                              Only{" "}
                              {rules[group.id]
                                .map((checkboxId) => {
                                  return checkboxes.find(
                                    (checkbox) => checkbox.id === checkboxId
                                  )?.label;
                                })
                                .join(", ")}{" "}
                              can be selected together.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            <div className="w-1/2">
              <p className="text-slate-500">
                Only these checkboxes can be checked together
              </p>
              <ScrollArea
                className={`h-[234px] rounded-md border p-4 bg-blue-100  ${
                  selectedGroupId &&
                  rules[selectedGroupId] &&
                  rules[selectedGroupId].length > 1
                    ? "bg-green-300"
                    : "bg-red-300"
                } `}
                key={selectedGroupId}
              >
                {groups
                  .filter((group) => group.id === selectedGroupId)
                  .map((group) => {
                    const groupCheckboxes = getCheckboxesForGroup(group.id);
                    return (
                      <ul key={group.id + "test"} className="space-y-2">
                        {groupCheckboxes.map((checkbox) => (
                          <li
                            key={checkbox.id + "test"}
                            className=" flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={isInRule(checkbox.id as UUID)}
                              onCheckedChange={() =>
                                assignToRule(checkbox.id, group.id)
                              }
                              id={`preview-${group.id}-${checkbox.id}`}
                            />
                            <Label
                              htmlFor={`preview-${group.id}-${checkbox.id}`}
                            >
                              {checkbox.label}
                            </Label>
                          </li>
                        ))}
                      </ul>
                    );
                  })}
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="assign" className="space-y-4">
          <div className="flex space-x-4">
            <ScrollArea className="h-[260px] w-1/2 rounded-md border p-4">
              <div className="space-y-4">
                {groups.length === 0 ? (
                  <div className="col-span-full">
                    <p className="text-center text-muted-foreground py-8">
                      No groups to preview. Create some groups and add
                      checkboxes to them.
                    </p>
                  </div>
                ) : (
                  groups.map((group) => {
                    const groupCheckboxes = getCheckboxesForGroup(group.id);

                    return (
                      <Card
                        key={group.id}
                        onClick={() => setSelectedGroupId(group.id)}
                        className={` ${selectedGroupId === group.id && "dark"}`}
                      >
                        <CardHeader>
                          <CardTitle>{group.name}</CardTitle>
                          <CardDescription>
                            {groupCheckboxes.length} checkbox
                            {groupCheckboxes.length !== 1 ? "es" : ""}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {groupCheckboxes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No checkboxes in this group.
                            </p>
                          ) : (
                            <Reorder.Group
                              axis="y"
                              values={groupCheckboxes}
                              onReorder={handleCheckboxesReorder}
                              className="space-y-2 "
                            >
                              {groupCheckboxes.map((checkbox) => (
                                <Reorder.Item
                                  key={checkbox.id}
                                  value={checkbox}
                                  className="cursor-grab flex items-center space-x-2"
                                  dragConstraints={{ top: 0, bottom: 0 }}
                                >
                                  <Checkbox
                                    checked={true}
                                    id={`preview-${group.id}-${checkbox.id}`}
                                  />
                                  <Label
                                    htmlFor={`preview-${group.id}-${checkbox.id}`}
                                  >
                                    {checkbox.label}
                                  </Label>
                                </Reorder.Item>
                              ))}
                            </Reorder.Group>
                          )}

                          {rules[group.id] && rules[group.id].length > 1 && (
                            <p className="text-sm mt-3 text-gray-300">
                              Only{" "}
                              {rules[group.id]
                                .map((checkboxId) => {
                                  return checkboxes.find(
                                    (checkbox) => checkbox.id === checkboxId
                                  )?.label;
                                })
                                .join(", ")}{" "}
                              can be selected together.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {selectedGroupId && (
              <ScrollArea
                className="h-[260px] w-1/2 rounded-md border p-4"
                key={selectedGroupId}
              >
                {sections.map((mainSection) => (
                  <div key={mainSection.id}>
                    <p className="text-slate-500 text-sm">{mainSection.name}</p>
                    <Separator></Separator>
                    <div className="space-y-2 mt-2 mb-2">
                      {selectedGroupId &&
                        mainSection.inspectable_object_inspection_form_sub_section.map(
                          (subSection) => {
                            const isInAssigneSubSections = assignedSubSections[
                              subSection.id
                            ]
                              ? assignedSubSections[subSection.id].includes(
                                  selectedGroupId
                                )
                              : false;

                            return (
                              <div
                                key={subSection.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  checked={isInAssigneSubSections}
                                  onCheckedChange={() =>
                                    toggleSelectionGroupsInSubSections(
                                      subSection.id
                                    )
                                  }
                                  id={`subSections-${subSection.id}`}
                                />
                                <Label htmlFor={`subSections-${subSection.id}`}>
                                  {subSection.name}
                                </Label>
                              </div>
                            );
                          }
                        )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </div>
          <div className="flex justify-end">
            {atLeastOneSubSectionSelected ? (
              <Button
                onClick={async () => {
                  const { error, id } = await handleCreateCheckboxGroups();
                  if (error) {
                    showNotification(
                      "Checkbox-Manager",
                      `Error: ${error.message} (${error.code})`,
                      "error"
                    );
                  } else {
                    showNotification(
                      "Checkbox-Manger",
                      "Success fully created checkboxes",
                      "info"
                    );
                    refetchSubSectionsData();
                    setOpen(false);
                    if (id) {
                      scrollToSection(id as UUID);
                    }
                  }
                }}
              >
                Save
              </Button>
            ) : (
              <Button variant="outline">Save</Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
