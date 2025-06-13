import { UUID } from "crypto";
import { ExtractionSection } from "./ExtractionSection";
import { createClient } from "@/utils/supabase/server";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { ErrorHandler } from "@/components/ErrorHandler";
import Link from "next/link";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { ArrowBigLeft } from "lucide-react";
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

export default async function TextInputFieldTrainingPage({
  params,
}: {
  params: Promise<{ profile_id: UUID; training_id: UUID }>;
}) {
  const profileId = (await params).profile_id;
  const trainingId = (await params).training_id;

  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const { inspectableObjectProfile, inspectableObjectProfileError } =
    await dbActions.fetchInspectableObjectProfile(profileId);

  if (inspectableObjectProfileError)
    return <ErrorHandler error={inspectableObjectProfileError}></ErrorHandler>;

  const { stringExtractionTraining, stringExtractionTrainingError } =
    await dbActions.fetchStringExtractionTraining(trainingId);

  if (stringExtractionTrainingError)
    return <ErrorHandler error={stringExtractionTrainingError}></ErrorHandler>;

  const {
    stringExtractionTrainingExamples,
    stringExtractionTrainingExamplesError,
  } = await dbActions.fetchStringExtractionTrainingExamples(trainingId);

  if (stringExtractionTrainingExamplesError)
    return (
      <ErrorHandler
        error={stringExtractionTrainingExamplesError}
      ></ErrorHandler>
    );

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
                  Profile
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href={`/form-builder/inspectable-object-profiles/${profileId}?tab=stringExtractionTraining`}
                >
                  {inspectableObjectProfile?.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {stringExtractionTraining?.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div>
        <ExtractionSection
          stringExtractionTraining={stringExtractionTraining}
          stringExtractionTrainingExamples={stringExtractionTrainingExamples}
          trainingId={trainingId}
        ></ExtractionSection>
      </div>
    </>
  );
}
