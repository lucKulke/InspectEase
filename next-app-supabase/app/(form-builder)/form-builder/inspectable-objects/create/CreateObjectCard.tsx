"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

import { useNotification } from "@/app/context/NotificationContext";
import { UUID } from "crypto";
import {
  createObjectPropertys,
  createObject,
  fetchObjectProfileObjPropertys,
} from "./actions";
import { SupabaseError } from "@/lib/globalInterfaces";
import {
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectProfileResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { redirect } from "next/navigation";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateObjectCardProps {
  availableProfiles: IInspectableObjectProfileResponse[];
  availableProfilesError: SupabaseError | null;
}

export const CreateObjectCard = ({
  availableProfiles,
  availableProfilesError,
}: CreateObjectCardProps) => {
  const { showNotification } = useNotification();
  const [selectedProfileId, setSelectedProfileId] = useState<UUID>();
  const [rerenderkey, setRerenderKey] = useState(+new Date());
  const [profilePropertys, setProfilePropertys] =
    useState<IInspectableObjectProfileObjPropertyResponse[]>();
  const [propertyValues, setPropertyValues] = useState<Record<string, string>>(
    {}
  );

  if (availableProfilesError) {
    showNotification(
      "Fetch Profiles",
      `Error: ${availableProfilesError.message} (${availableProfilesError.code})`,
      "error"
    );
    redirect(formBuilderLinks["inspectableObjects"].href);
  }

  const handleSelectProfile = async (profileId: UUID) => {
    setSelectedProfileId(profileId);
    console.log("load propertys");
    const {
      inspectableObjectProfilePropertys,
      inspectableObjectProfilePropertysError,
    } = await fetchObjectProfileObjPropertys(profileId);

    if (inspectableObjectProfilePropertysError) {
      showNotification(
        "Fetch Profile Propertys",
        `Error: ${inspectableObjectProfilePropertysError.message} (${inspectableObjectProfilePropertysError.code})`,
        "error"
      );
      setSelectedProfileId(undefined);
      setRerenderKey(+new Date());
    } else {
      setProfilePropertys(inspectableObjectProfilePropertys);
    }
  };

  const handleInputChange = (propertyId: string, value: string) => {
    setPropertyValues((prev) => ({ ...prev, [propertyId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedProfileId) return;
    const { inspectableObject, inspectableObjectError } = await createObject(
      selectedProfileId
    );

    if (inspectableObjectError) {
      showNotification(
        "Create Object",
        `Error: ${inspectableObjectError.message} (${inspectableObjectError.code})`,
        "error"
      );
      return;
    }

    const { inspectableObjectPropertys, inspectableObjectPropertysError } =
      await createObjectPropertys(inspectableObject.id, propertyValues);

    if (inspectableObjectPropertysError) {
      showNotification(
        "Create Object Propertys",
        `Error: ${inspectableObjectPropertysError.message} (${inspectableObjectPropertysError.code})`,
        "error"
      );
      return;
    }

    showNotification(
      "Create Object",
      `Successfully created Object with id '${inspectableObject.id}'`,
      "info"
    );

    redirect(formBuilderLinks["inspectableObjects"].href);
  };

  function compare(
    a: IInspectableObjectProfileObjPropertyResponse,
    b: IInspectableObjectProfileObjPropertyResponse
  ) {
    if (a.order_number < b.order_number) return -1;

    if (a.order_number > b.order_number) return 1;

    return 0;
  }
  return (
    <Card className="w-1/2">
      <div className="flex justify-between items-center">
        <CardHeader>
          <CardTitle>Object</CardTitle>
          <CardDescription>Enter objects metadata.</CardDescription>
        </CardHeader>
      </div>
      <CardContent className="space-y-5">
        <Select
          key={rerenderkey}
          onValueChange={(profileId) => handleSelectProfile(profileId as UUID)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select profile..." />
          </SelectTrigger>
          <SelectContent>
            {availableProfiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {profilePropertys && (
          <div>
            <ul className="space-y-3">
              {profilePropertys?.sort(compare).map((property) => (
                <li key={property.id}>
                  <Label>
                    {property.name}
                    <Input
                      onChange={(e) =>
                        handleInputChange(property.id, e.target.value)
                      }
                      value={propertyValues[property.id] || ""}
                    ></Input>
                  </Label>
                  <p className="text-sm text-slate-500">
                    {property.description}
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex justify-center mt-5">
              <Button onClick={() => handleSubmit()}>Submit</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
