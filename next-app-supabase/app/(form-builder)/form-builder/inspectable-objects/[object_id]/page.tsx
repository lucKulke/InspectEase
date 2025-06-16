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
import { InspectionPlanTypes } from "./InspectionPlanTypes";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { DiscAlbum } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

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
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/form-builder/inspectable-objects">
                  Objects
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{objectId}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="m-5 ml-8 mr-8">
        <ObjectCard
          objectProfileProps={profileProperties}
          objectInfo={inspectableObjectWithPropertiesAndProfile}
        ></ObjectCard>
        <div className="m-9">
          <p className="text-slate-500">Inspection plans</p>
        </div>
        <div className=" m-5">
          <InspectionPlanTypes
            objectId={objectId}
            inspectionFormsWithProps={inspectableObjectInspectionForms}
            profileFormTypes={inspectableObjectProfileFormTypesWithProps}
          ></InspectionPlanTypes>
        </div>
      </div>
    </>
  );
}
