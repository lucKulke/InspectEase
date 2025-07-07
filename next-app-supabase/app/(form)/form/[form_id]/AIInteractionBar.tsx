import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

import { UUID } from "crypto";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/Spinner";
import { VoiceInput } from "./VoiceInput";
import { VoiceInputV2 } from "./VoiceInputV2";

interface AIInteractionBarProps {
  formId: UUID;
  processAiResposne: (userInput: string) => Promise<void>;
  isThinking: boolean;
}

export const AIInteractionBar = ({
  formId,
  processAiResposne,
  isThinking,
}: AIInteractionBarProps) => {
  const [userInput, setUserInput] = useState<string>("");
  const [transcribing, setTranscribing] = useState<boolean>(false);

  return (
    <div className="border-2 bg-gray-50 fixed bottom-0 w-full h-40 flex  space-x-6 justify-center items-center">
      <VoiceInputV2
        setUserInput={setUserInput}
        userInput={userInput}
        processAiResposne={processAiResposne}
        setTranscribing={setTranscribing}
        isThinking={isThinking}
      ></VoiceInputV2>
      {/* <VoiceInput
        userInput={userInput}
        processAiResposne={processAiResposne}
        setUserInput={setUserInput}
        setTranscribing={setTranscribing}
        isThinking={isThinking}
      ></VoiceInput> */}
      <div className="flex space-x-2">
        {transcribing ? (
          <Textarea
            value={userInput}
            disabled={true}
            className="w-[400px] max-md:w-[200px] bg-white max-h-36"
          ></Textarea>
        ) : (
          <Textarea
            value={userInput}
            disabled={isThinking}
            className="w-[400px] max-md:w-[200px] bg-white max-h-36"
            onChange={(e) => setUserInput(e.target.value)}
          ></Textarea>
        )}

        {isThinking ? (
          <Spinner></Spinner>
        ) : (
          <>
            {userInput.length > 1 ? (
              <Button onClick={() => processAiResposne(userInput)}>Send</Button>
            ) : (
              <Button variant={"outline"}>Send</Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
