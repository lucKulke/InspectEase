import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { redirect } from "next/navigation";

import { PageHeading } from "@/components/PageHeading";
import { ObjectCard } from "./ObjectCard";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import {
  IInspectableObjectProfilePropertyResponse,
  IInspectableObjectPropertyResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
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

  const {
    inspectableObjectWithPropertiesAndProfile,
    inspectableObjectWithPropertiesAndProfileError,
  } = await dbActions.fetchInspectableObjectWithPropertiesAndProfile(objectId);

  if (inspectableObjectWithPropertiesAndProfileError)
    errorList.push(inspectableObjectWithPropertiesAndProfileError);

  let profileProperties: IInspectableObjectProfilePropertyResponse[] | null =
    null;
  let profilePropertiesError: SupabaseError | null = null;

  if (inspectableObjectWithPropertiesAndProfile) {
    const {
      inspectableObjectProfilePropertys,
      inspectableObjectProfilePropertysError,
    } = await dbActions.fetchInspectableObjectProfilePropertys(
      inspectableObjectWithPropertiesAndProfile[0].inspectable_object_profile.id
    );

    if (inspectableObjectProfilePropertysError)
      errorList.push(inspectableObjectProfilePropertysError);

    profileProperties = inspectableObjectProfilePropertys;
    profilePropertiesError = inspectableObjectProfilePropertysError;
  }

  return (
    <div>
      <PageHeading>Object</PageHeading>
      {errorList.length > 0 ? (
        <ErrorHandler errors={errorList} />
      ) : (
        <ObjectCard
          objectProfileProps={profileProperties}
          objectInfo={inspectableObjectWithPropertiesAndProfile}
        ></ObjectCard>
      )}
    </div>
  );
}

// {errorList.length > 0 ? (
//   <ErrorHandler errors={errorList} />
// ) : inspectableObjectWithPropertiesAndProfile && profileProperties ? (
//   <ObjectCard
//     objectProfileProps={profileProperties}
//     objectInfo={inspectableObjectWithPropertiesAndProfile[0]}
//   ></ObjectCard>
// ) : (
//   <div>No data...</div>
// )}
