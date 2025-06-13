"use client";
import { ColumnDef, DynamicTable } from "@/components/MainTable";
import {
  IInspectableObjectInspectionFormWithProps,
  IInspectableObjectProfileFormTypePropertyResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { UUID } from "crypto";
import React, { useState } from "react";
import { deleteEntireForms } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

interface InspectionPlanTableProps {
  inspectionPlans: IInspectableObjectInspectionFormWithProps[];
  formTypeProps: IInspectableObjectProfileFormTypePropertyResponse[];
}
export const InspectionPlanTable = ({
  inspectionPlans,
  formTypeProps,
}: InspectionPlanTableProps) => {
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

  const handleDelete = async (formIds: string[]) => {
    const { deletedForms, deletedFormsError } = await deleteEntireForms(
      formIds as UUID[]
    );

    if (deletedFormsError) {
      showNotification(
        "Delete form",
        `Error: ${deletedFormsError.message} (${deletedFormsError.code})`,
        "error"
      );
    } else if (deletedForms) {
      showNotification("Delete forms", `Successfully deleted forms`, "info");
      setObjects((prev) => prev.filter((obj) => !formIds.includes(obj.id)));
    }
  };

  function compareFormTypeProps(
    a: IInspectableObjectProfileFormTypePropertyResponse,
    b: IInspectableObjectProfileFormTypePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <div>
      <DynamicTable
        columns={columns}
        data={objects}
        basePath={`/form-editor`}
        rowsPerPage={5}
        onBulkDelete={handleDelete}
      ></DynamicTable>
    </div>
  );
};
