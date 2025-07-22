"use client";

import { useNotification } from "@/app/context/NotificationContext";
import { LLMConfigPage } from "@/components/LLMProviderConfig";
import { SpeachToTextConfig } from "@/components/SeachToTextConfig";
import {
  IUserApiKeysResponse,
  IUserProfileResponse,
} from "@/lib/database/public/publicInterface";
import { useState } from "react";
import { updateUserProfileAiTokens } from "./actions";
import { UUID } from "crypto";

interface APICompProps {
  userApiKeys: IUserApiKeysResponse;
  userProfile: IUserProfileResponse;
}
export const APIComp = ({ userApiKeys, userProfile }: APICompProps) => {
  const { showNotification } = useNotification();
  const [LLMCredentials, setLLMCredentials] = useState<{
    openai_token: string | null;
    anthropic_token: string | null;
    cohere_token: string | null;
    mistral_token: string | null;
  }>({
    openai_token: userApiKeys.openai_token ?? null,
    anthropic_token: null,
    cohere_token: null,
    mistral_token: null,
  });

  const [speachToTextCredentials, setSpeachToTextCredentials] = useState<{
    deepgram_token: string | null;
    azure: string | null;
    google: string | null;
  }>({
    deepgram_token: userApiKeys.deepgram_token ?? null,
    azure: null,
    google: null,
  });
  const handleUpdateLLMAPICredentials = async (
    apiKeys: Record<string, string>
  ) => {
    const { updatedProfile, updatedProfileError } =
      await updateUserProfileAiTokens(apiKeys, userProfile.user_id as UUID);
    if (updatedProfileError) {
      showNotification(
        "Update users llm api keys",
        `Error: ${updatedProfileError.message} (${updatedProfileError.code})`,
        "error"
      );
    } else if (updatedProfile) {
      showNotification(
        "Update users llm api keys",
        `Successfully updated users api keys`,
        "info"
      );

      setLLMCredentials((prev) => ({ ...prev, ...apiKeys }));
    }
  };
  const handleUpdateSpeachToTextAPICredentials = async (
    apiKeys: Record<string, string>
  ) => {
    const { updatedProfile, updatedProfileError } =
      await updateUserProfileAiTokens(apiKeys, userProfile.user_id as UUID);
    if (updatedProfileError) {
      showNotification(
        "Update users speach to text api keys",
        `Error: ${updatedProfileError.message} (${updatedProfileError.code})`,
        "error"
      );
    } else if (updatedProfile) {
      showNotification(
        "Update users speach to text api keys",
        `Successfully updated speach to text users api keys`,
        "info"
      );

      setSpeachToTextCredentials((prev) => ({ ...prev, ...apiKeys }));
    }
  };

  return (
    <div className="space-y-6">
      <LLMConfigPage
        currentCredentials={LLMCredentials}
        updateAiTokens={handleUpdateLLMAPICredentials}
      ></LLMConfigPage>
      <SpeachToTextConfig
        currentCredentials={speachToTextCredentials}
        updateAiTokens={handleUpdateSpeachToTextAPICredentials}
      ></SpeachToTextConfig>
    </div>
  );
};
