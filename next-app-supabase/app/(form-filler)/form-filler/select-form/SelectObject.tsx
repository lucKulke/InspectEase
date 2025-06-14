"use client";
import { ColumnDef, DynamicTable } from "@/components/MainTable";
import {
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectWithPropertiesResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useState } from "react";

interface SelectObjectProps {
  selectedGroup: string;
  profileProps: IInspectableObjectProfileObjPropertyResponse[];
  objectsWithProps: IInspectableObjectWithPropertiesResponse[];
  handleObjectSelect: (objectId: string) => void;
}

export const SelectObject = ({
  profileProps,
  selectedGroup,
  objectsWithProps,
  handleObjectSelect,
}: SelectObjectProps) => {
  const [columns, setColumns] = useState<ColumnDef[]>(
    profileProps
      .filter((profileProp) => profileProp.profile_id === selectedGroup)
      .sort(compareProfileProps)
      .map((profileProp) => ({
        key: profileProp.name,
        header: profileProp.name,
        sortable: true,
      }))
  );

  const objectList = objectsWithProps
    .filter((object) => object.profile_id === selectedGroup)
    .map((object) => {
      const newObject: Record<string, string> = {};
      profileProps
        .filter((profileProp) => profileProp.profile_id === selectedGroup)
        .sort(compareProfileProps)
        .map((profileProp) => {
          const objProp = object.inspectable_object_property.filter(
            (objProp) => objProp.profile_property_id === profileProp.id
          )[0];

          newObject["id"] = object.id;
          newObject[profileProp.name] = objProp?.value ?? "";
        });
      return newObject;
    });

  const [objects, setObjects] = useState<any[]>(objectList);
  function compareProfileProps(
    a: IInspectableObjectProfileObjPropertyResponse,
    b: IInspectableObjectProfileObjPropertyResponse
  ) {
    if (a.order_number > b.order_number) return 1;
    if (a.order_number < b.order_number) return -1;
    return 0;
  }
  return (
    <DynamicTable
      columns={columns}
      data={objects}
      onClick={handleObjectSelect}
      selectOnly={true}
    />
  );
};
