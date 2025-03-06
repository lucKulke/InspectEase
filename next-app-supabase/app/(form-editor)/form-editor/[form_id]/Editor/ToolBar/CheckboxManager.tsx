"use client";

import { useState } from "react";
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
import { IInspectableObjectInspectionFormMainSectionWithSubSection } from "@/lib/database/form-builder/formBuilderInterfaces";
import { Reorder } from "framer-motion";

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
}

interface CheckboxManagerProps {
  sections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
}

export const CheckboxManager = ({ sections }: CheckboxManagerProps) => {
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

  // Create a new checkbox
  const handleCreateCheckbox = () => {
    if (!newCheckboxLabel.trim()) return;

    const newCheckbox: CheckboxItem = {
      id: `checkbox-${Date.now()}`,
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
      id: `group-${Date.now()}`,
      name: newGroupName,
      checkboxIds: [],
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
    console.log("record", record);
    let foundSelectedSubSection = false;
    Object.entries(record).forEach(([subSectionId, groupIdList]) => {
      console.log("group list", groupIdList);
      if (groupIdList.length > 0) foundSelectedSubSection = true;
    });
    return foundSelectedSubSection;
  };

  // Toggle a checkbox in a assigned sub sections
  const toggleSelectionGroupsInSubSections = (subSectionId: string) => {
    if (!selectedGroupId) return;

    const copyOfAssignedSubSections = { ...assignedSubSections };

    const currentGroupIdList = copyOfAssignedSubSections[subSectionId];
    if (currentGroupIdList) {
      if (currentGroupIdList.includes(selectedGroupId)) {
        copyOfAssignedSubSections[subSectionId] = currentGroupIdList.filter(
          (groupId) => groupId !== selectedGroupId
        );
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
    const updatedItems = reorderItems(newOrder);
    setCheckboxes(updatedItems);
  };

  const handleCreateSelectionGroups = async () => {};

  return (
    <div>
      <Tabs defaultValue="create" className="mt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
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

                      return (
                        <div
                          key={checkbox.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`group-${selectedGroupId}-${checkbox.id}`}
                            checked={isInSelectedGroup}
                            onCheckedChange={() =>
                              toggleCheckboxInGroup(checkbox.id)
                            }
                          />
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
                            const isInAssigneSubSections =
                              assignedSubSections[subSection.id]?.includes(
                                selectedGroupId
                              );

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
              <Button onClick={() => handleCreateSelectionGroups}>Save</Button>
            ) : (
              <Button variant="outline">Save</Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
