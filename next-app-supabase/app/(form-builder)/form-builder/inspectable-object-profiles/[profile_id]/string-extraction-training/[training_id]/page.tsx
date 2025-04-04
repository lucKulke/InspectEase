import { UUID } from "crypto";
import { ExtractionSection } from "./ExtractionSection";
import { createClient } from "@/utils/supabase/server";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { ErrorHandler } from "@/components/ErrorHandler";
import Link from "next/link";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { ArrowBigLeft } from "lucide-react";

export default async function TextInputFieldTrainingPage({
  params,
}: {
  params: Promise<{ profile_id: UUID; training_id: UUID }>;
}) {
  const profileId = (await params).profile_id;
  const trainingId = (await params).training_id;

  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

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
    <div>
      <Link
        className="flex items-center mb-2"
        href={
          formBuilderLinks["inspectableObjectProfiles"].href + "/" + profileId
        }
      >
        <ArrowBigLeft /> Back to profile
      </Link>
      <ExtractionSection
        stringExtractionTraining={stringExtractionTraining}
        stringExtractionTrainingExamples={stringExtractionTrainingExamples}
        trainingId={trainingId}
      ></ExtractionSection>
    </div>
  );
}
