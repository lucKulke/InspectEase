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
  IInspectableObjectWithPropertiesAndProfileResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";

import { redirect } from "next/navigation";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { profileIcons } from "@/lib/availableIcons";
import { UUID } from "crypto";

interface ObjectCardProps {
  objectInfo: IInspectableObjectWithPropertiesAndProfileResponse[] | null;
  objectProfileProps: IInspectableObjectProfilePropertyResponse[] | null;
}

export const ObjectCard = async ({
  objectInfo,
  objectProfileProps,
}: ObjectCardProps) => {
  const objectProps: Record<UUID, IInspectableObjectPropertyResponse> = {};

  if (!objectInfo || !objectProfileProps) return <div>No Data...</div>;

  objectInfo[0].inspectable_object_property.forEach((objectProp) => {
    objectProps[objectProp.profile_property_id] = objectProp;
  });

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
        <div className="m-7">
          {profileIcons[objectInfo[0].inspectable_object_profile.icon_key]}
        </div>
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
