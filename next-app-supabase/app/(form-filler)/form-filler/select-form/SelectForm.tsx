"use client";
import { ColumnDef, DynamicTable } from "@/components/MainTable";
import {
  IInspectableObjectInspectionFormWithProps,
  IInspectableObjectProfileFormTypePropertyResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { UUID } from "crypto";
import React, { useState } from "react";

import { useNotification } from "@/app/context/NotificationContext";

interface SelectFormProps {
  inspectionPlans: IInspectableObjectInspectionFormWithProps[];
  formTypeProps: IInspectableObjectProfileFormTypePropertyResponse[];
  handleSelect: (id: string) => void;
}
export const SelectForm = ({
  inspectionPlans,
  formTypeProps,
  handleSelect,
}: SelectFormProps) => {
  const { showNotification } = useNotification();

  const objectList = inspectionPlans.map((inspectinoPlan) => {
    const newObject: Record<string, string> = {};
    formTypeProps.sort(compareFormTypeProps).map((formTypeProp) => {
      const objProp =
        inspectinoPlan.inspectable_object_inspection_form_property.filter(
          (formProp) => formProp.form_type_prop_id === formTypeProp.id
        )[0];

      newObject["id"] = inspectinoPlan.id;
      newObject[formTypeProp.name] = objProp?.value ?? "";
    });
    return newObject;
  });
  const [objects, setObjects] = useState<any[]>(objectList);
  const [columns, setColumns] = useState<ColumnDef[]>(
    formTypeProps.sort(compareFormTypeProps).map((formTypeProp) => ({
      key: formTypeProp.name,
      header: formTypeProp.name,
      sortable: true,
    }))
  );

  function compareFormTypeProps(
    a: IInspectableObjectProfileFormTypePropertyResponse,
    b: IInspectableObjectProfileFormTypePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <DynamicTable
      columns={columns}
      data={objects}
      onClick={handleSelect}
      selectOnly={true}
    />
  );
};
