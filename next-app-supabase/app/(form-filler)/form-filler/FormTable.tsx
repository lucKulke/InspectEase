"use client";
import { ColumnDef, DynamicTable } from "@/components/MainTable";
import {
  IInspectableObjectInspectionFormWithProps,
  IInspectableObjectProfileFormTypePropertyResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { UUID } from "crypto";
import React, { useState } from "react";

import { useNotification } from "@/app/context/NotificationContext";
import { IFillableFormPlusFillableFields } from "@/lib/database/form-filler/formFillerInterfaces";
import { ActiveForm } from "@/lib/globalInterfaces";
import { IconType, profileIcons } from "@/lib/availableIcons";

interface FormTableProps {
  isBeeingEdited: ActiveForm[];
  forms: IFillableFormPlusFillableFields[];
  deleteForms: (formId: string[]) => Promise<void>;
}
export const FormTable = ({
  forms,
  deleteForms,
  isBeeingEdited,
}: FormTableProps) => {
  const [columns, setColumns] = useState<ColumnDef[]>([
    {
      key: "object_profile_icon",
      header: "Icon",
      sortable: true,
      cell: (value) => <div>{profileIcons[value as IconType]}</div>,
      className: "w-10",
    },
    {
      key: "identifier_string",
      header: "ID",
      sortable: true,
    },
    {
      key: "form_type",
      header: "Form Type",
      sortable: true,
    },

    {
      key: "updated_at",
      header: "Updated At",
      sortable: true,
    },
    {
      key: "created_at",
      header: "Created At",
      sortable: true,
    },
    {
      key: "currently_editing",
      header: "Currently being edited",
      sortable: true,
      className: "text-right",
      cell: (value) => (
        <div>
          {value && (
            <div className="absolute top-2 right-2 ">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-sky-500"></span>
              </span>
            </div>
          )}
        </div>
      ),
    },
  ]);
  const [objects, setObjects] = useState<any[]>(
    forms.map((form) => {
      return {
        ...form,
        currently_editing: isBeeingEdited.some((f) => f.formId === form.id),
      };
    })
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
      onBulkDelete={deleteForms}
      basePath="/form"
    />
  );
};
