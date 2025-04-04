import { ErrorHandler } from "@/components/ErrorHandler";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { IInspectableObjectProfileResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { InspectableObjectsTable } from "./InspectableObjectsTable";

interface ObjectsProps {
  profile: IInspectableObjectProfileResponse;
}

export const Objects = async ({ profile }: ObjectsProps) => {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const {
    inspectableObjectProfilePropertys,
    inspectableObjectProfilePropertysError,
  } = await dbActions.fetchInspectableObjectProfileObjPropertys(profile.id);
  if (inspectableObjectProfilePropertysError)
    return (
      <ErrorHandler
        error={inspectableObjectProfilePropertysError}
      ></ErrorHandler>
    );

  const { inspectableObjectsWitProps, inspectableObjectsWitPropsError } =
    await dbActions.fetchInspectableObjectsByProfileIdWithProperties(
      profile.id
    );
  if (inspectableObjectsWitPropsError)
    return (
      <ErrorHandler error={inspectableObjectsWitPropsError}></ErrorHandler>
    );

  return (
    <div>
      <InspectableObjectsTable
        profile={profile}
        profileProps={inspectableObjectProfilePropertys}
        objectsWithProps={inspectableObjectsWitProps}
      ></InspectableObjectsTable>
    </div>
  );
};
