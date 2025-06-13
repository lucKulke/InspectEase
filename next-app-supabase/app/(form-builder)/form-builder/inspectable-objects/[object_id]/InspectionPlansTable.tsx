"use client";
import React, { useEffect } from "react";

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

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IInspectableObjectInspectionFormPropertyResponse,
  IInspectableObjectInspectionFormResponse,
  IInspectableObjectInspectionFormWithProps,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeResponse,
  IInspectableObjectProfileFormTypeWithProps,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { useState } from "react";
import { Cog } from "lucide-react";
import Link from "next/link";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { randomUUID, UUID } from "crypto";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { InspectionPlanTable } from "./InspectionPlanTable";

interface InspectionPlanTableProps {
  inspectionFormsWithProps: IInspectableObjectInspectionFormWithProps[];
  profileFormTypes: IInspectableObjectProfileFormTypeWithProps[];
}

export const InspectionPlanTypes = ({
  inspectionFormsWithProps,
  profileFormTypes,
}: InspectionPlanTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabFromUrl || profileFormTypes[0].id
  );

  useEffect(() => {
    if (tabFromUrl !== activeTab) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("tab", activeTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [activeTab]);

  return (
    <div className="">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {profileFormTypes.map((type) => {
            return (
              <TabsTrigger key={type.id} value={type.id} className="space-x-2">
                <p>{type.name}</p>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {profileFormTypes.map((type) => {
          return (
            <TabsContent key={type.id} value={type.id}>
              <InspectionPlanTable
                formTypeProps={
                  type.inspectable_object_profile_form_type_property
                }
                inspectionPlans={inspectionFormsWithProps.filter(
                  (inspectionForm) => inspectionForm.form_type_id === type.id
                )}
              ></InspectionPlanTable>
            </TabsContent>
          );
        })}

        {/* {profileFormTypes.map((type) => {
          const inspectableObjectProfilePropertys =
            objects[type.id].profileProps;
          const inspectableObjectsWitProps =
            objects[type.id].objectsWithProps;
          return (
            <TabsContent key={profile.id} value={profile.id}>
              <InspectableObjectsTable
                profile={profile}
                profileProps={inspectableObjectProfilePropertys}
                objectsWithProps={inspectableObjectsWitProps}
              ></InspectableObjectsTable>
            </TabsContent>
          );
        })} */}
      </Tabs>
    </div>
    // <ul className="space-y-3">
    //   {profileFormTypes.map((formType) => (
    //     <li key={formType.id}>
    //       <h2>{formType.name}</h2>
    //       <ScrollArea className="border-2 border-black rounded-lg p-4">
    //         <Table>
    //           <TableCaption>
    //             All "{formType.name}" inspection plans for object
    //           </TableCaption>
    //           <TableHeader>
    //             <TableRow>
    //               {formType.inspectable_object_profile_form_type_property
    //                 .sort(compareFormTypeProps)
    //                 .map((formTypeProp) => (
    //                   <TableCell key={formTypeProp.id}>
    //                     <p className="font-bold">{formTypeProp.name}</p>
    //                   </TableCell>
    //                 ))}
    //             </TableRow>
    //           </TableHeader>
    //           <TableBody>
    //             {inspectionFormsWithProps
    //               .filter(
    //                 (inspectionForm) =>
    //                   inspectionForm.form_type_id === formType.id
    //               )
    //               .map((inspectionForm) => (
    //                 <TableRow key={inspectionForm.id}>
    //                   {formType.inspectable_object_profile_form_type_property
    //                     .sort(compareFormTypeProps)
    //                     .map((type) => {
    //                       const form =
    //                         inspectionForm.inspectable_object_inspection_form_property.filter(
    //                           (inspectionForm) =>
    //                             inspectionForm.form_type_prop_id === type.id
    //                         )[0];

    //                       return form ? (
    //                         <TableCell key={form.id}>{form?.value}</TableCell>
    //                       ) : (
    //                         <TableCell key={randomUUID()}></TableCell>
    //                       );
    //                     })}
    //                   <TableCell>
    //                     <div className="flex justify-end">
    //                       <Link href={"/form-editor/" + inspectionForm.id}>
    //                         <Cog></Cog>
    //                       </Link>
    //                     </div>
    //                   </TableCell>
    //                 </TableRow>
    //               ))}
    //           </TableBody>
    //         </Table>
    //       </ScrollArea>
    //     </li>
    //   ))}
    // </ul>
  );
};
