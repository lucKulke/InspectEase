import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { redirect } from "next/navigation";

import { PageHeading } from "@/components/PageHeading";
import { ObjectCard } from "./ObjectCard";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { IInspectableObjectPropertyResponse } from "@/lib/database/form-builder/formBuilderInterfaces";

export default async function ObjectPage({
  params,
}: {
  params: Promise<{ object_id: UUID }>;
}) {
  const objectId = (await params).object_id;

  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbActions = new DBActionsFormBuilderFetch(supabase);
  const { inspectableObject, inspectableObjectError } =
    await dbActions.fetchInspectableObject(objectId);
  const { inspectableObjectPropertys, inspectableObjectPropertysError } =
    await dbActions.fetchInspectableObjectPropertys(objectId);

  const { inspectableObjectProfile, inspectableObjectProfileError } =
    await dbActions.fetchInspectableObjectProfile(inspectableObject.profile_id);

  const {
    inspectableObjectProfilePropertys,
    inspectableObjectProfilePropertysError,
  } = await dbActions.fetchInspectableObjectProfilePropertys(
    inspectableObject.profile_id
  );

  // for performance reasons
  const objectProps: Record<UUID, IInspectableObjectPropertyResponse> = {};
  inspectableObjectPropertys.forEach((objectProp) => {
    objectProps[objectProp.profile_property_id] = objectProp;
  });

  return (
    <div>
      <PageHeading>Object</PageHeading>
      <ObjectCard
        object={inspectableObject}
        objectError={inspectableObjectError}
        objectProps={objectProps}
        objectPropsError={inspectableObjectPropertysError}
        objectProfile={inspectableObjectProfile}
        objectProfileError={inspectableObjectProfileError}
        objectProfileProps={inspectableObjectProfilePropertys}
        objectProfilePropsError={inspectableObjectProfilePropertysError}
      ></ObjectCard>
    </div>
  );
}
