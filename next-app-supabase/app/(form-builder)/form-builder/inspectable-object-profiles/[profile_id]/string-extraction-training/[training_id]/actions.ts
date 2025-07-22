"use server";

import { createClient } from "@/utils/supabase/server";
import { Example } from "./ExtractionSection";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { UUID } from "crypto";
import { DBActionsFormBuilderDelete } from "@/lib/database/form-builder/formBuilderDelete";
import { DBActionsFormBuilderUpdate } from "@/lib/database/form-builder/formBuilderUpdate";
import { IStringExtractionTrainingExampleInsert } from "@/lib/database/form-builder/formBuilderInterfaces";
import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import OpenAI from "openai";
import { ResponseInput } from "openai/resources/responses/responses.mjs";
import { IUserProfile } from "@/lib/globalInterfaces";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";

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

export async function updateStringExtractionTrainingPrompt(
  newPrompt: string,
  trainingId: UUID
) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderUpdate(supabase);

  return await dbActions.updateStringExtractionTrainingPrompt(
    newPrompt,
    trainingId
  );
}

export async function requestToChatGPT(
  message: string,
  prompt: string,
  examples: Example[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const publicFetch = new DBActionsPublicFetch(supabase);
  const { userApiKeys, userApiKeysError } = await publicFetch.fetchUserApiKeys(
    user.id as UUID
  );

  if (userApiKeysError) return null;
  if (!userApiKeys) return null;

  const client = new OpenAI({
    apiKey: userApiKeys.openai_token ?? "", // Ensure this is stored in .env.local
  });

  const messages: { role: string; content: string }[] = [];
  examples.forEach((example) => {
    messages.push({ role: "user", content: example.input });
    messages.push({ role: "assistant", content: example.output });
  });

  messages.push({ role: "user", content: message });

  console.log(messages);

  const response = await client.responses.create({
    model: "gpt-3.5-turbo",
    instructions: prompt,
    input: messages as ResponseInput,
  });

  return response.output_text;
}
