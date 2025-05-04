import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { requestIntentRecognition } from "./actions";
import { UUID } from "crypto";

interface AIInteractionBarProps {
  formId: UUID;
  processAiResposne: (userInput: string) => Promise<void>;
}

export const AIInteractionBar = ({
  formId,
  processAiResposne,
}: AIInteractionBarProps) => {
  const [userInput, setUserInput] = useState<string>("");

  return (
    <div className="border-2 bg-gray-50 fixed bottom-0 w-full h-20 flex justify-center items-center">
      <div className="flex space-x-2">
        <Input
          className="w-[400px]"
          onChange={(e) => setUserInput(e.target.value)}
        ></Input>
        {userInput.length > 1 ? (
          <Button onClick={() => processAiResposne(userInput)}>Send</Button>
        ) : (
          <Button variant={"outline"}>Send</Button>
        )}
      </div>
    </div>
  );
};
