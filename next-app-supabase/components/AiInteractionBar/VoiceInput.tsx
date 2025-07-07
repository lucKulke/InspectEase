"use client";

import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceTranscription } from "@/hooks/useVoiceTranscription";

interface VoiceInputProps {
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  processAiResposne: (userInput: string) => Promise<void>;
  disabled: boolean;
}

export const VoiceInput = ({
  userInput,
  setUserInput,
  processAiResposne,
  disabled,
}: VoiceInputProps) => {
  const { isRecording, toggleRecording } = useVoiceTranscription({
    userInput,
    setUserInput,
    processAiResposne,
  });

  return (
    <button
      disabled={disabled}
      onClick={toggleRecording}
      className={cn(
        "flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
        isRecording
          ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
          : "bg-white hover:bg-gray-100 focus:ring-gray-500"
      )}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording ? (
        <>
          <Square className="w-6 h-6 text-white" />
          <span className="absolute w-12 h-12 rounded-full animate-ping bg-red-500 opacity-75"></span>
        </>
      ) : (
        <Mic className="w-6 h-6 text-gray-700" />
      )}
    </button>
  );
};
