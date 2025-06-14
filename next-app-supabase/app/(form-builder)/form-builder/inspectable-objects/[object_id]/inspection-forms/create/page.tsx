import { NewInspectionFormCard } from "./NewInspectionFormCard";

import { PageHeading } from "@/components/PageHeading";
import { ErrorHandler } from "@/components/ErrorHandler";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
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

export default async function CreateInpsectionPlanPage({
  params,
}: {
  params: Promise<{ object_id: UUID }>;
}) {
  const objectId = (await params).object_id;
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const { inspectableObject, inspectableObjectError } =
    await dbActions.fetchInspectableObject(objectId);

  if (inspectableObjectError)
    return <ErrorHandler error={inspectableObjectError}></ErrorHandler>;

  if (!inspectableObject) return <div>No object found. try again...</div>;

  const {
    inspectableObjectProfileWithFormTypes,
    inspectableObjectProfileWithFormTypesError,
  } = await dbActions.fetchInspectableObjectProfileWitFormTypes(
    inspectableObject.profile_id
  );

  if (inspectableObjectProfileWithFormTypesError)
    return (
      <ErrorHandler
        error={inspectableObjectProfileWithFormTypesError}
      ></ErrorHandler>
    );

  if (!inspectableObjectProfileWithFormTypes)
    return <div>No form types found. try again...</div>;

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
              <BreadcrumbLink
                href={`/form-builder/inspectable-objects/${objectId}`}
              >
                {objectId}
              </BreadcrumbLink>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Form</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="m-5 ml-8 mr-8">
        <div className="flex justify-center">
          <NewInspectionFormCard
            objectId={inspectableObject.id}
            profileWithFormTypes={inspectableObjectProfileWithFormTypes}
          ></NewInspectionFormCard>
        </div>
      </div>
    </>
  );
}
