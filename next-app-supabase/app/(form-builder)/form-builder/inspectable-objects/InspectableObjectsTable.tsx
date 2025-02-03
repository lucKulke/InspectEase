"use client";
import React, { useEffect, useState } from "react";
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
import { createClient } from "@/utils/supabase/server";
import { Bike, Car, Truck, Cog, Plus } from "lucide-react";
import {
  fetchInspectableObjectProfilePropertys,
  fetchInspectableObjects,
  fetchInspectableObjectsByProfileId,
  fetchObjectPropertys,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

import {
  IInspectableObjectProfileResponse,
  IInspectableObjectProfilePropertyResponse,
  IInspectableObjectResponse,
  IInspectableObjectPropertyResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";

import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { UUID } from "crypto";
import { Spinner } from "@/components/Spinner";

import Link from "next/link";

const objectTypes: Record<string, any> = {
  motorbike: <Bike />,
  car: <Car />,
  truck: <Truck />,
};

interface InspectableObjectsTableProps {
  profile: IInspectableObjectProfileResponse;
}

export const InspectableObjectsTable = ({
  profile,
}: InspectableObjectsTableProps) => {
  const { showNotification } = useNotification();

  const [profilePropertys, setProfilePropertys] =
    useState<IInspectableObjectProfilePropertyResponse[]>();
  const [objects, setObjects] =
    useState<Record<UUID, IInspectableObjectPropertyResponse[]>>();
  const [propertyOrder, setPropertyOrder] = useState<Record<UUID, number>>();

  const fetchProfilePropertys = async () => {
    const {
      inspectableObjectProfilePropertys,
      inspectableObjectProfilePropertysError,
    } = await fetchInspectableObjectProfilePropertys(profile.id);

    if (inspectableObjectProfilePropertysError) {
      showNotification(
        "Fetch Profile Propertys",
        `Error: ${inspectableObjectProfilePropertysError.message} ${inspectableObjectProfilePropertysError.code}`,
        "error"
      );
      return;
    }

    const tempPropOrder: Record<UUID, number> = {};
    inspectableObjectProfilePropertys.forEach((prop) => {
      tempPropOrder[prop.id] = prop.order_number;
    });

    setPropertyOrder(tempPropOrder);

    setProfilePropertys(inspectableObjectProfilePropertys);
    return inspectableObjectProfilePropertys;
  };

  const fetchObjectsByProfileId = async () => {
    const { inspectableObjects, inspectableObjectsError } =
      await fetchInspectableObjectsByProfileId(profile.id);

    if (inspectableObjectsError) {
      showNotification(
        `Fetch Objects with profile '${profile.name}'`,
        `Error: ${inspectableObjectsError.message} ${inspectableObjectsError.code}`,
        "error"
      );
      return;
    }

    // Use Promise.all to fetch properties in parallel
    const objectPropertiesPromises = inspectableObjects.map(async (object) => {
      console.log("fetch object props", object.id);
      const { inspectableObjectPropertys, inspectableObjectPropertysError } =
        await fetchObjectPropertys(object.id);

      if (inspectableObjectPropertysError) {
        console.error(
          `Error fetching properties for object ${object.id}:`,
          inspectableObjectPropertysError
        );
        return { objectId: object.id, properties: [] }; // Handle errors gracefully
      }

      return { objectId: object.id, properties: inspectableObjectPropertys };
    });

    const resolvedProperties = await Promise.all(objectPropertiesPromises);

    // Convert array to Record<UUID, IInspectableObjectPropertyResponse[]>
    const tempObjects: Record<UUID, IInspectableObjectPropertyResponse[]> = {};
    resolvedProperties.forEach(({ objectId, properties }) => {
      tempObjects[objectId] = properties;
    });

    setObjects(tempObjects);
    console.log("temp objects", tempObjects);
  };

  useEffect(() => {
    const profileProper = fetchProfilePropertys();
    const obj = fetchObjectsByProfileId();
  }, []);

  function compareProfilePropertys(
    a: IInspectableObjectProfilePropertyResponse,
    b: IInspectableObjectProfilePropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }

  function compareObjectPropertys(
    a: IInspectableObjectPropertyResponse,
    b: IInspectableObjectPropertyResponse
  ) {
    console.log("before");
    if (!propertyOrder) return 0;
    console.log("true");
    if (
      propertyOrder[a.profile_property_id] <
      propertyOrder[b.profile_property_id]
    )
      return -1;

    if (
      propertyOrder[a.profile_property_id] >
      propertyOrder[b.profile_property_id]
    )
      return 1;

    return 0;
  }

  return objects ? (
    <Table>
      <TableCaption>A list of your objects.</TableCaption>
      <TableHeader>
        <TableRow>
          {profilePropertys?.sort(compareProfilePropertys).map((property) => (
            <TableHead key={property.id}>{property.name}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(objects).map(([objectId, propertys]) => {
          return (
            <TableRow key={objectId}>
              {propertys.sort(compareObjectPropertys).map((prop) => (
                <TableCell key={prop.id}>{prop.value}</TableCell>
              ))}
              <TableCell>
                <div className="flex justify-end">
                  <Link
                    href={
                      formBuilderLinks["inspectableObjects"].href +
                      "/" +
                      objectId
                    }
                  >
                    <Cog />
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  ) : (
    <div className="flex justify-center">
      <Spinner></Spinner>
    </div>
  );
};
