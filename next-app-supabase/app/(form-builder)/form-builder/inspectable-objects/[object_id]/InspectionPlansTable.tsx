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
  IInspectableObjectInspectionFormResponse,
  IInspectableObjectInspectionFormsWithProps,
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileFormTypeWithProps,
} from "@/lib/database/form-builder/formBuilderInterfaces";

import { Cog } from "lucide-react";
import Link from "next/link";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { UUID } from "crypto";

interface InspectionPlanTableProps {
  objectId: UUID;
  inspectionFormsWithProps: IInspectableObjectInspectionFormsWithProps[];
  profileFormTypes: IInspectableObjectProfileFormTypeWithProps[];
}

export const InspectionPlansTable = ({
  objectId,
  inspectionFormsWithProps,
  profileFormTypes,
}: InspectionPlanTableProps) => {
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
                  {formType.inspectable_object_profile_form_type_property.map(
                    (formTypeProp) => (
                      <TableCell key={formTypeProp.id}>
                        {formTypeProp.name}
                      </TableCell>
                    )
                  )}
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
                      {inspectionForm.inspectable_object_inspection_form_property.map(
                        (inspectionFormProp) => (
                          <TableCell>{inspectionFormProp.value}</TableCell>
                        )
                      )}
                      <TableCell>
                        <div className="flex justify-end">
                          <Link
                            href={
                              formBuilderLinks["inspectableObjects"].href +
                              "/" +
                              objectId +
                              "/inspection-forms/" +
                              inspectionForm.id
                            }
                          >
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
