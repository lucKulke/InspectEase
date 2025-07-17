"use server";

import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { DBActionsFormFillerFetch } from "@/lib/database/form-filler/formFillerFetch";
import {
  IMainCheckboxResponse,
  ISubCheckboxData,
  ISubCheckboxResponse,
} from "@/lib/database/form-filler/formFillerInterfaces";
import { DBActionsFormFillerUpdate } from "@/lib/database/form-filler/formFillerUpdate";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { FormEngine } from "@/lib/form-engine/formEngine";
import { SupabaseError, WhisperResponse } from "@/lib/globalInterfaces";
import { createClient } from "@/utils/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";

export async function updateMainCheckboxValue(
  formId: UUID,
  checkboxId: UUID,
  value: boolean
) {
  const supabase = await createClient();
  const formEngine = new FormEngine(supabase);
  formEngine.updateMainCheckbox(formId, checkboxId, value);
}

export async function updateSubCheckboxValue(
  formId: UUID,
  checkboxId: UUID,
  value: boolean
) {
  const supabase = await createClient();
  const formEngine = new FormEngine(supabase);
  formEngine.updateSubCheckbox(formId, checkboxId, value);
}

export async function updateTextInputFieldValue(
  formId: UUID,
  textInputFieldId: UUID,
  value: string
) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerUpdate(supabase);

  return await dbActions.updateTextInputField(textInputFieldId, value);
}

// intent recognition
interface TrainingsDataItem {
  id: string;
  prompt: string;
  examples: {
    user: string;
    ai: string;
  }[];
}

interface TextInput {
  id: string;
  label: string;
  trainingsId: string;
}

interface Checkbox {
  id: string;
  label: string;
  checked: boolean;
}

interface Task {
  id: string;
  description: string;
  checkboxes: Checkbox[];
}

interface CheckboxGroupWithTasks {
  id: string;
  label: string;
  tasks: Task[];
}

interface CheckboxGroupWithoutTasks {
  id: string;
  label: string;
  checkboxes: Checkbox[];
}

interface SubSection {
  id: string;
  label: string;
  textInput: TextInput[];
  checkboxGroupsWithTasks: CheckboxGroupWithTasks[];
  checkboxGroupsWithoutTasks: CheckboxGroupWithoutTasks[];
}

interface MainSection {
  id: string;
  label: string;
  subSections: SubSection[];
}

interface RootData {
  trainingsData: TrainingsDataItem[];
  formData: MainSection[];
}

interface APICall {
  userSentence: string;
  llm: { model: string; token: string; temp: number };
  form: RootData;
}

interface TextInputField {
  id: string;
  value: string;
}

interface CheckboxItem {
  id: string;
  label: string;
  checked: boolean;
}
export interface IIntentRecognitionResponse {
  textInputFields: TextInputField[];
  checkboxes: CheckboxItem[];
}

async function getStringExtractionTrainings(trainingId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  return await dbActions.fetchStringExtractionTrainingWithExamples(trainingId);
}

async function getFormData(
  formId: UUID
): Promise<{ formData: RootData | null; error: SupabaseError | null }> {
  const form: RootData = { trainingsData: [], formData: [] };
  const trainingsIds: UUID[] = [];

  const supabase = await createClient("form_filler");
  const dbActions = new DBActionsFormFillerFetch(supabase);
  const { formData, formDataError } = await dbActions.fetchFillableFormData(
    formId
  );
  if (formDataError) {
    return { formData: null, error: formDataError };
  } else if (formData) {
    formData.main_section.forEach((mainSection) => {
      const newMainSection: MainSection = {
        id: mainSection.id,
        label: mainSection.name,
        subSections: [],
      };
      mainSection.sub_section.forEach((subSection) => {
        const newSubSection: SubSection = {
          id: subSection.id,
          label: subSection.name,
          textInput: [],
          checkboxGroupsWithoutTasks: [],
          checkboxGroupsWithTasks: [],
        };
        subSection.text_input.forEach((textInputField) => {
          if (textInputField.training_id) {
            trainingsIds.push(textInputField.training_id);
          }
          newSubSection.textInput.push({
            id: textInputField.id,
            label: textInputField.label,
            trainingsId: textInputField.training_id ?? "",
          });
        });

        subSection.checkbox_group.forEach((checkboxGroup) => {
          if (checkboxGroup.task.length > 0) {
            // with tasks
            const newGroup: CheckboxGroupWithTasks = {
              id: checkboxGroup.id,
              label: checkboxGroup.name,
              tasks: [],
            };

            const subCheckboxList: ISubCheckboxData[] = [];
            checkboxGroup.main_checkbox.forEach((mainCheckbox) => {
              mainCheckbox.sub_checkbox.forEach((subCheckbox) => {
                subCheckboxList.push(subCheckbox);
              });
            });

            checkboxGroup.task.forEach((task) => {
              const checkboxes = subCheckboxList.filter(
                (checkbox) => checkbox.task_id === task.id
              );
              newGroup.tasks.push({
                id: task.id,
                description: task.description,
                checkboxes: checkboxes.map((subCheckbox) => {
                  const newSubCheckbox: Checkbox = {
                    id: subCheckbox.id,
                    label: checkboxGroup.main_checkbox.filter(
                      (mainCheckbox) =>
                        mainCheckbox.id === subCheckbox.main_checkbox_id
                    )[0].label,
                    checked: subCheckbox.checked,
                  };
                  return newSubCheckbox;
                }),
              });
            });
            newSubSection.checkboxGroupsWithTasks.push(newGroup);
          } else {
            // without tasks

            const newGroup: CheckboxGroupWithoutTasks = {
              id: checkboxGroup.id,
              label: checkboxGroup.name,
              checkboxes: [],
            };
            checkboxGroup.main_checkbox.forEach((mainCheckbox) => {
              newGroup.checkboxes.push({
                id: mainCheckbox.id,
                label: mainCheckbox.label,
                checked: mainCheckbox.checked,
              });
            });

            newSubSection.checkboxGroupsWithoutTasks.push(newGroup);
          }
        });
        newMainSection.subSections.push(newSubSection);
      });
      form.formData.push(newMainSection);
    });
  }

  for (let index = 0; index < trainingsIds.length; index++) {
    const trainingsId = trainingsIds[index];

    const {
      stringExtractionTrainingWithExamples,
      stringExtractionTrainingWithExamplesError,
    } = await getStringExtractionTrainings(trainingsId);
    if (stringExtractionTrainingWithExamples) {
      form.trainingsData.push({
        id: stringExtractionTrainingWithExamples.id,
        prompt: stringExtractionTrainingWithExamples.prompt ?? "",
        examples:
          stringExtractionTrainingWithExamples.string_extraction_training_example.map(
            (example) => {
              const newExample = {
                user: example.input,
                ai: example.output,
              };
              return newExample;
            }
          ),
      });
    }
  }

  return { formData: form, error: null };
}

async function intentRecognitionAPICall(
  data: RootData,
  userInput: string,
  processId: string
): Promise<IIntentRecognitionResponse | false> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const dbActions = new DBActionsPublicFetch(supabase);
  if (!user) return false;

  const { userApiKeys, userApiKeysError } = await dbActions.fetchUserApiKeys(
    user.id as UUID
  );

  const payload: APICall = {
    userSentence: userInput,
    llm: {
      model: "gpt-4o-mini",
      token: userApiKeys?.openai_token ?? "",
      temp: 0,
    },
    form: data,
  };
  try {
    const response = await fetch(
      `https://${process.env.INTENT_RECOGNITION_DOMAIN}/intent?uuid=${processId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
}

function parseApiResponse(raw: any): IIntentRecognitionResponse {
  console.log("raw", raw);
  return {
    textInputFields: raw.textInputFields,
    checkboxes: raw.checkboxes.map((checkbox: any) => {
      checkbox.checked = checkbox.checked === "True";
      return checkbox;
    }),
  };
}
export async function requestIntentRecognition(
  formId: UUID,
  userInput: string,
  processId: string
): Promise<IIntentRecognitionResponse | false> {
  const { formData, error } = await getFormData(formId);

  if (formData) {
    const response = await intentRecognitionAPICall(
      formData,
      userInput,
      processId
    );
    return parseApiResponse(response);
  } else {
    return false;
  }
}

export async function getIntentRecognitionDomain() {
  return process.env.INTENT_RECOGNITION_DOMAIN!;
}

export interface TranscribeResponse {
  text: string;
  statusCode: 0 | 1 | 2 | 3;
}

export async function transcribeAudio(
  apiProvider: "deepgram" | "whisper",
  audioBlob: Blob
): Promise<TranscribeResponse> {
  console.log("audioBlob", audioBlob);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbActions = new DBActionsPublicFetch(supabase);
  const { userApiKeys, userApiKeysError } = await dbActions.fetchUserApiKeys(
    user?.id as UUID
  );

  if (!userApiKeys)
    return {
      text: "",
      statusCode: 1,
    };

  switch (apiProvider) {
    case "deepgram":
      return await transcribeAudioDeepgram(
        audioBlob,
        userApiKeys.deepgram_token
      );
    case "whisper":
      return await transcribeAudioWhisper(audioBlob, userApiKeys.openai_token);
  }
}

async function transcribeAudioDeepgram(
  audioBlob: Blob,
  deepgramToken: string | null
): Promise<TranscribeResponse> {
  if (!deepgramToken) {
    return {
      text: "",
      statusCode: 1,
    };
  }

  const res = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&language=de",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${deepgramToken}`,
        "Content-Type": "audio/webm",
      },
      body: audioBlob, // Your audio Blob
    }
  );

  if (!res.ok) {
    throw new Error(`Deepgram error: ${res.status}`);
  }

  const data = await res.json();
  console.log("data", data);
  console.log("data", data.results?.channels?.[0]);
  const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript;

  return {
    text: transcript,
    statusCode: 0,
  };
}

async function transcribeAudioWhisper(
  audioBlob: Blob,
  whisperToken: string | null
): Promise<TranscribeResponse> {
  if (!whisperToken) {
    return {
      text: "",
      statusCode: 1,
    };
  }
  const url = `${process.env.LIVE_TRANSCIPTION_DOMAIN!}/transcribe`;
  return {
    text: "",
    statusCode: 1,
  };
}
