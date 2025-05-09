import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import { redirect } from "next/navigation";

import { PageHeading } from "@/components/PageHeading";
import { ObjectCard } from "./ObjectCard";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import {
  IInspectableObjectProfileObjPropertyResponse,
  IInspectableObjectPropertyResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { ErrorHandler } from "../../../../../components/ErrorHandler";
import { SupabaseError } from "@/lib/globalInterfaces";

import { MainAddButton } from "@/components/MainAddButton";
import { InspectionPlansTable } from "./InspectionPlansTable";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { DiscAlbum } from "lucide-react";

export default async function ObjectPage({
  params,
}: {
  params: Promise<{ object_id: UUID }>;
}) {
  const objectId = (await params).object_id;
  const errorList: SupabaseError[] = [];

  const supabase = await createClient("form_builder");

  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const {
    inspectableObjectWithPropertiesAndProfile,
    inspectableObjectWithPropertiesAndProfileError,
  } = await dbActions.fetchInspectableObjectWithPropertiesAndProfile(objectId);

  if (inspectableObjectWithPropertiesAndProfileError)
    return (
      <ErrorHandler error={inspectableObjectWithPropertiesAndProfileError} />
    );

  let profileProperties: IInspectableObjectProfileObjPropertyResponse[] | null =
    null;
  let profilePropertiesError: SupabaseError | null = null;

  if (inspectableObjectWithPropertiesAndProfile) {
    const {
      inspectableObjectProfilePropertys,
      inspectableObjectProfilePropertysError,
    } = await dbActions.fetchInspectableObjectProfileObjPropertys(
      inspectableObjectWithPropertiesAndProfile.inspectable_object_profile.id
    );

    if (inspectableObjectProfilePropertysError)
      return <ErrorHandler error={inspectableObjectProfilePropertysError} />;

    profileProperties = inspectableObjectProfilePropertys;
    profilePropertiesError = inspectableObjectProfilePropertysError;
  }

  if (!inspectableObjectWithPropertiesAndProfile) return <div>No object</div>;

  const {
    inspectableObjectInspectionForms,
    inspectableObjectInspectionFormsError,
  } = await dbActions.fetchInspectableObjectInspectionFormsWithProps(objectId);

  if (inspectableObjectInspectionFormsError)
    return <ErrorHandler error={inspectableObjectInspectionFormsError} />;

  const {
    inspectableObjectProfileFormTypesWithProps,
    inspectableObjectProfileFormTypesWithPropsError,
  } = await dbActions.fetchInspectableObjectProfileFormTypesWithProps(
    inspectableObjectWithPropertiesAndProfile.inspectable_object_profile.id
  );

  if (inspectableObjectProfileFormTypesWithPropsError)
    return (
      <ErrorHandler error={inspectableObjectProfileFormTypesWithPropsError} />
    );

  if (!inspectableObjectInspectionForms) return <div></div>;

  return (
    <div>
      <PageHeading>Object</PageHeading>
      <ObjectCard
        objectProfileProps={profileProperties}
        objectInfo={inspectableObjectWithPropertiesAndProfile}
      ></ObjectCard>
      <div className="flex justify-between m-6 items-center ">
        <p className="text-slate-500">Inspection plans</p>
        <MainAddButton
          href={
            formBuilderLinks["inspectableObjects"].href +
            "/" +
            objectId +
            "/inspection-forms/create"
          }
        ></MainAddButton>
      </div>
      <div className=" m-5">
        <InspectionPlansTable
          inspectionFormsWithProps={inspectableObjectInspectionForms}
          profileFormTypes={inspectableObjectProfileFormTypesWithProps}
        ></InspectionPlansTable>
      </div>
    </div>
  );
}
