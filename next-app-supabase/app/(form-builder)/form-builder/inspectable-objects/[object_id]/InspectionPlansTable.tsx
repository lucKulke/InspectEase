import React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IInspectableObjectInspectionFormPropertyResponse,
  IInspectableObjectInspectionFormResponse,
  IInspectableObjectInspectionFormWithProps,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileFormTypeWithProps,
} from "@/lib/database/form-builder/formBuilderInterfaces";

import { Cog } from "lucide-react";
import Link from "next/link";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { randomUUID, UUID } from "crypto";

interface InspectionPlanTableProps {
  inspectionFormsWithProps: IInspectableObjectInspectionFormWithProps[];
  profileFormTypes: IInspectableObjectProfileFormTypeWithProps[];
}

export const InspectionPlansTable = ({
  inspectionFormsWithProps,
  profileFormTypes,
}: InspectionPlanTableProps) => {
  function compareFormTypeProps(
    a: IInspectableObjectProfileFormTypePropertyResponse,
    b: IInspectableObjectProfileFormTypePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <ul className="space-y-3">
      {profileFormTypes.map((formType) => (
        <li key={formType.id}>
          <h2>{formType.name}</h2>
          <ScrollArea className="border-2 border-black rounded-lg p-4">
            <Table>
              <TableCaption>
                All "{formType.name}" inspection plans for object
              </TableCaption>
              <TableHeader>
                <TableRow>
                  {formType.inspectable_object_profile_form_type_property
                    .sort(compareFormTypeProps)
                    .map((formTypeProp) => (
                      <TableCell key={formTypeProp.id}>
                        <p className="font-bold">{formTypeProp.name}</p>
                      </TableCell>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspectionFormsWithProps
                  .filter(
                    (inspectionForm) =>
                      inspectionForm.form_type_id === formType.id
                  )
                  .map((inspectionForm) => (
                    <TableRow key={inspectionForm.id}>
                      {formType.inspectable_object_profile_form_type_property
                        .sort(compareFormTypeProps)
                        .map((type) => {
                          const form =
                            inspectionForm.inspectable_object_inspection_form_property.filter(
                              (inspectionForm) =>
                                inspectionForm.form_type_prop_id === type.id
                            )[0];

                          return form ? (
                            <TableCell key={form.id}>{form?.value}</TableCell>
                          ) : (
                            <TableCell key={randomUUID()}></TableCell>
                          );
                        })}
                      <TableCell>
                        <div className="flex justify-end">
                          <Link href={"/form-editor/" + inspectionForm.id}>
                            <Cog></Cog>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </li>
      ))}
    </ul>
  );
};
