import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { requestIntentRecognition } from "./actions";
import { UUID } from "crypto";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/Spinner";

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

  return (
    <div className="border-2 bg-gray-50 fixed bottom-0 w-full h-40 flex  space-x-6 justify-center items-center">
      <div className="flex space-x-2">
        <Textarea
          disabled={isThinking}
          className="w-[400px] bg-white max-h-36"
          onChange={(e) => setUserInput(e.target.value)}
        ></Textarea>
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
