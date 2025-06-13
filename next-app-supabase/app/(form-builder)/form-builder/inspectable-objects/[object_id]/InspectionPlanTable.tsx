"use client";
import { ColumnDef, DynamicTable } from "@/components/MainTable";
import { IInspectableObjectProfileFormTypePropertyResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useState } from "react";

interface InspectionPlanTableProps {
  inspectionPlans: any[];
  formTypeProps: IInspectableObjectProfileFormTypePropertyResponse[];
}
export const InspectionPlanTable = ({
  inspectionPlans,
  formTypeProps,
}: InspectionPlanTableProps) => {
  //   const [columns, setColumns] = useState<ColumnDef[]>(
  //     profileProps.sort(compareProfileProps).map((profileProp) => ({
  //       key: profileProp.name,
  //       header: profileProp.name,
  //       sortable: true,
  //     }))
  //   );

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
      {/* <DynamicTable
        columns={columns}
        data={objects}
        basePath="inspectable-objects"
        onBulkDelete={handleDeleteObjects}
      ></DynamicTable> */}
    </div>
  );
};
