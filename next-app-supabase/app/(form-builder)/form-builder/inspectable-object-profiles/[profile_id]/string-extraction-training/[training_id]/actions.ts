"use server";

import { createClient } from "@/utils/supabase/server";
import { Example } from "./ExtractionSection";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { UUID } from "crypto";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { IStringExtractionTrainingExampleInsert } from "@/lib/database/form-builder/formBuilderInterfaces";
import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";

export async function fetchExistingExamples(trainingId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);
  return await dbActions.fetchStringExtractionTrainingExamples(trainingId);
}

export async function delteExamples(toDelete: UUID[]) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderDelete(supabase);
  return await dbActions.deleteStringExtractionTrainingExamples(toDelete);
}

export async function updateExamples(toUpdate: Example[]) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);
  for (const example of toUpdate) {
    await dbActions.updateStringExtractionExamples(
      {
        input: example.input,
        output: example.output,
      },
      example.id
    );
  }
}
export async function insertNewExamples(
  toInsert: IStringExtractionTrainingExampleInsert[]
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  return await dbActions.createNewStringExtractionTrainingExamples(toInsert);
}
