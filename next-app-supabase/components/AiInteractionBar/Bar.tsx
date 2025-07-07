import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

import { UUID } from "crypto";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/Spinner";
import { VoiceInput } from "./VoiceInput";

interface AIInteractionBarProps {
  formId: UUID;
  processAiResposne: (userInput: string) => Promise<void>;
  isAutoFilling: boolean;
}

export const AIInteractionBarV2 = ({
  formId,
  processAiResposne,
  isAutoFilling,
}: AIInteractionBarProps) => {
  const [userInput, setUserInput] = useState<string>("");

  return (
    <div className="border-2 bg-gray-50 fixed bottom-0 w-full h-40 flex  space-x-6 justify-center items-center">
      <VoiceInput
        setUserInput={setUserInput}
        userInput={userInput}
        processAiResposne={processAiResposne}
        disabled={isAutoFilling}
      ></VoiceInput>
      <Textarea
        value={userInput}
        disabled={isAutoFilling}
        className="w-[400px] max-md:w-[200px] bg-white max-h-36"
        onChange={(e) => setUserInput(e.target.value)}
      ></Textarea>
    </div>
  );
};
