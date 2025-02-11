"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IInspectableObjectInspectionFormPropertyResponse,
  IInspectableObjectInspectionFormWithProps,
  IInspectableObjectProfileFormTypePropertyResponse,
  IInspectableObjectProfileFormTypeWithProps,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { UUID } from "crypto";

import React from "react";

interface FormMetadataCardProps {
  formId: UUID;
  formMetadata: Record<UUID, IInspectableObjectInspectionFormPropertyResponse>;
  profileFormTypeWithProps: IInspectableObjectProfileFormTypeWithProps;
}
export const FormMetadataCard = ({
  formId,
  formMetadata,
  profileFormTypeWithProps,
}: FormMetadataCardProps) => {
  function compareProfileFormTypeProps(
    a: IInspectableObjectProfileFormTypePropertyResponse,
    b: IInspectableObjectProfileFormTypePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {profileFormTypeWithProps?.name}: {formId}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {profileFormTypeWithProps?.inspectable_object_profile_form_type_property
            ?.sort(compareProfileFormTypeProps)
            .map((profileFormTypeProp) => (
              <li
                key={profileFormTypeProp.id}
                className="flex items-center mb-2"
              >
                <h2 className="text-slate-600 mr-2">
                  {profileFormTypeProp.name}:
                </h2>
                <p>{formMetadata[profileFormTypeProp.id].value}</p>
              </li>
            ))}
        </ul>
      </CardContent>
    </Card>
  );
};
