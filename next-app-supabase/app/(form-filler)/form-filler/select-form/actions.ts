"use server";

import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { DBActionsFormFillerCreate } from "@/lib/database/form-filler/formFillerCreate";
import { IFillableFormInsert } from "@/lib/database/form-filler/formFillerInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function createFillableInspectionForm(
  newForm: IFillableFormInsert
): Promise<{ id: UUID | null; error: SupabaseError | null }> {
  const formBuilderSupabase = await createClient("form_builder");
  const dbActionsFormBuilder = new DBActionsFormBuilderFetch(
    formBuilderSupabase
  );
  const formFillerSupabase = await createClient("form_filler");
  const dbActionsFormFiller = new DBActionsFormFillerCreate(formFillerSupabase);

  const { form, formError } =
    await dbActionsFormFiller.createNewStringExtractionTrainingExamples(
      newForm
    );
}
