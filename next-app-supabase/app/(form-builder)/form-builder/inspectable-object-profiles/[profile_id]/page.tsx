import { createClient } from "@/utils/supabase/server";

import { PageHeading } from "@/components/PageHeading";
import { redirect } from "next/navigation";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { UUID } from "crypto";
import { ErrorHandler } from "@/components/ErrorHandler";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { ProfileData } from "./ProfileData";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { profileIcons } from "@/lib/availableIcons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { MetadataCard } from "./MetadataCard";

export default async function InspectableObjectProfilePage({
  params,
}: {
  params: Promise<{ profile_id: UUID }>;
}) {
  const profileId = (await params).profile_id;
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const {
    inspectableObjectProfileWithObjProps,
    inspectableObjectProfileWithObjPropsError,
  } = await dbActions.fetchInspectableObjectProfileWithObjProperties(profileId);

  if (inspectableObjectProfileWithObjPropsError)
    return (
      <ErrorHandler
        error={inspectableObjectProfileWithObjPropsError}
      ></ErrorHandler>
    );

  const {
    inspectableObjectProfileFormTypes,
    inspectableObjectProfileFormTypesError,
  } = await dbActions.fetchInspectableObjectProfileFormTypes(profileId);

  if (inspectableObjectProfileFormTypesError)
    return (
      <ErrorHandler
        error={inspectableObjectProfileFormTypesError}
      ></ErrorHandler>
    );

  const { stringExtractionTrainings, stringExtractionTrainingsError } =
    await dbActions.fetchStringExtractionTrainings(profileId);

  if (stringExtractionTrainingsError)
    return <ErrorHandler error={stringExtractionTrainingsError}></ErrorHandler>;

  if (!inspectableObjectProfileWithObjProps)
    return <div>No data available</div>;
  if (!inspectableObjectProfileFormTypes) return <div>No data available</div>;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/form-builder/inspectable-object-profiles">
                  Profiles
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {inspectableObjectProfileWithObjProps.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="m-5 ml-8 mr-8">
        <MetadataCard
          profileId={inspectableObjectProfileWithObjProps.id}
          name={inspectableObjectProfileWithObjProps.name}
          description={inspectableObjectProfileWithObjProps.description}
          icon_key={inspectableObjectProfileWithObjProps.icon_key}
        ></MetadataCard>
        <ProfileData
          profileId={profileId}
          inspectableObjectProfileWithObjProps={
            inspectableObjectProfileWithObjProps
          }
          inspectableObjectProfileFormTypes={inspectableObjectProfileFormTypes}
          stringExtractionTrainings={stringExtractionTrainings}
        ></ProfileData>
      </div>
    </>
  );
}
