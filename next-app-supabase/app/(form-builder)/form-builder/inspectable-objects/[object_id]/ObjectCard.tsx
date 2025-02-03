"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IInspectableObjectProfilePropertyResponse,
  IInspectableObjectProfileResponse,
  IInspectableObjectPropertyResponse,
  IInspectableObjectResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";

import { useNotification } from "@/app/context/NotificationContext";
import { redirect } from "next/navigation";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { profileIcons } from "@/lib/availableIcons";
import { UUID } from "crypto";

interface ObjectCardProps {
  object: IInspectableObjectResponse;
  objectProps: Record<UUID, IInspectableObjectPropertyResponse>;
  objectProfile: IInspectableObjectProfileResponse;
  objectProfileProps: IInspectableObjectProfilePropertyResponse[];
  objectError: SupabaseError | null;
  objectPropsError: SupabaseError | null;
  objectProfileError: SupabaseError | null;
  objectProfilePropsError: SupabaseError | null;
}

export const ObjectCard = ({
  object,
  objectError,
  objectProps,
  objectPropsError,
  objectProfileProps,
  objectProfilePropsError,
  objectProfile,
  objectProfileError,
}: ObjectCardProps) => {
  const { showNotification } = useNotification();

  if (objectError) {
    showNotification(
      "Fetch Object",
      `Error: ${objectError.message} (${objectError.code})`,
      "error"
    );
    redirect(formBuilderLinks["inspectableObjects"].href);
  }

  if (objectPropsError) {
    showNotification(
      "Fetch Object Propertys",
      `Error: ${objectPropsError.message} (${objectPropsError.code})`,
      "error"
    );
    redirect(formBuilderLinks["inspectableObjects"].href);
  }

  if (objectProfilePropsError) {
    showNotification(
      "Fetch Object Propertys",
      `Error: ${objectProfilePropsError.message} (${objectProfilePropsError.code})`,
      "error"
    );
    redirect(formBuilderLinks["inspectableObjects"].href);
  }

  if (objectProfileError) {
    showNotification(
      "Fetch Object Propertys",
      `Error: ${objectProfileError.message} (${objectProfileError.code})`,
      "error"
    );
    redirect(formBuilderLinks["inspectableObjects"].href);
  }

  function compare(
    a: IInspectableObjectProfilePropertyResponse,
    b: IInspectableObjectProfilePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  return (
    <Card className="w-1/2">
      <div className="flex justify-between">
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>all the objects metadata</CardDescription>
        </CardHeader>
        <div className="m-7">{profileIcons[objectProfile.icon_key]}</div>
      </div>
      <CardContent className="space-y-5">
        <ul className="space-y-4">
          {objectProfileProps.sort(compare).map((profileProp) => (
            <li key={profileProp.id} className="flex space-x-2">
              <h2 className="font-bold">{profileProp.name}:</h2>
              <p>{objectProps[profileProp.id].value}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
