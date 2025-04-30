import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { requestIntentRecognition } from "./actions";
import { UUID } from "crypto";

interface AIInteractionBarProps {
  formId: UUID;
}

export const AIInteractionBar = ({ formId }: AIInteractionBarProps) => {
  const [userInput, setUserInput] = useState<string>("");

  const handleSend = async () => {
    await requestIntentRecognition(formId, userInput);
  };

  return (
    <div className="border-2 fixed bottom-0 w-full h-20 flex justify-center items-center">
      <div className="flex space-x-2">
        <Input
          className="w-[400px]"
          onChange={(e) => setUserInput(e.target.value)}
        ></Input>
        {userInput.length > 1 ? (
          <Button onClick={handleSend}>Send</Button>
        ) : (
          <Button variant={"outline"}>Send</Button>
        )}
      </div>
    </div>
  );
};
