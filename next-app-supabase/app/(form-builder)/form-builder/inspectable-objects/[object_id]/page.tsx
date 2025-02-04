import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { redirect } from "next/navigation";

import { PageHeading } from "@/components/PageHeading";
import { ObjectCard } from "./ObjectCard";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { IInspectableObjectPropertyResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { ErrorHandler } from "./ErrorHandler";
import { SupabaseError } from "@/lib/globalInterfaces";

export default async function ObjectPage({
  params,
}: {
  params: Promise<{ object_id: UUID }>;
}) {
  const objectId = (await params).object_id;
  const errorList: SupabaseError[] = [];

  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const { inspectableObject, inspectableObjectError } =
    await dbActions.fetchInspectableObject(objectId);
  if (inspectableObjectError) errorList.push(inspectableObjectError);

  const { inspectableObjectPropertys, inspectableObjectPropertysError } =
    await dbActions.fetchInspectableObjectPropertys(objectId);
  if (inspectableObjectPropertysError)
    errorList.push(inspectableObjectPropertysError);

  const test = await dbActions.fetchInspectableObjectWithProperties(objectId);

  return <div>page</div>;

  const { inspectableObjectProfile, inspectableObjectProfileError } =
    await dbActions.fetchInspectableObjectProfile(inspectableObject.profile_id);
  if (inspectableObjectProfileError)
    errorList.push(inspectableObjectProfileError);

  const {
    inspectableObjectProfilePropertys,
    inspectableObjectProfilePropertysError,
  } = await dbActions.fetchInspectableObjectProfilePropertys(
    inspectableObject.profile_id
  );
  if (inspectableObjectProfilePropertysError)
    errorList.push(inspectableObjectProfilePropertysError);

  // for performance reasons
  const objectProps: Record<UUID, IInspectableObjectPropertyResponse> = {};
  inspectableObjectPropertys.forEach((objectProp) => {
    objectProps[objectProp.profile_property_id] = objectProp;
  });

  return (
    <div>
      <PageHeading>Object</PageHeading>
      <ErrorHandler errors={errorList} />
      <ObjectCard
        object={inspectableObject}
        objectProps={objectProps}
        objectProfile={inspectableObjectProfile}
        objectProfileProps={inspectableObjectProfilePropertys}
      ></ObjectCard>
    </div>
  );
}
