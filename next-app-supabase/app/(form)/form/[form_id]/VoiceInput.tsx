// components/VoiceInput.tsx
import { useState, useRef, useEffect } from "react";
import { transcribeAudio } from "./actions";

import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  processAiResposne: (userInput: string) => Promise<void>;
  setTranscribing: React.Dispatch<React.SetStateAction<boolean>>;
  isThinking: boolean;
}

export const VoiceInput = ({
  setUserInput,
  processAiResposne,
  setTranscribing,
  isThinking,
}: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1]; // remove "data:...base64,"
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    setUserInput("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunks.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      setTranscribing(true);
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });

      const base64Audio = await blobToBase64(audioBlob);

      const result = await transcribeAudio(base64Audio);
      setTranscribing(false);
      setUserInput(result.output.transcription);

      processAiResposne(result.output.transcription);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Customize this key combo as needed
      if (event.key === "m" && !event.repeat && !isThinking) {
        event.preventDefault();
        setIsRecording((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <button
      disabled={isThinking}
      onClick={() => {
        setIsRecording(!isRecording);
      }}
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

// <div>
//   <button onClick={isRecording ? stopRecording : startRecording}>
//     {isRecording ? "Stop" : "Speak"}
//   </button>
// </div>;
