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
  const ws = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [transcript, setTranscript] = useState("");

  const handleStart = async () => {
    ws.current = new WebSocket("ws://localhost:8000/ws/audio");
    ws.current.onmessage = (event) => {
      setUserInput((prev) => prev + " " + event.data);
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext!;
    const audioContext = new AudioContextClass({
      sampleRate: 16000,
    });
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const int16Buffer = convertFloat32ToInt16(input);
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(int16Buffer);
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    processorRef.current = processor;
  };

  const handleStop = () => {
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    ws.current?.close();
  };

  useEffect(() => {
    if (isRecording) {
      handleStart();
    } else {
      handleStop();
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

// Convert Float32 [-1, 1] to Int16
function convertFloat32ToInt16(buffer: Float32Array): ArrayBuffer {
  const l = buffer.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = Math.max(-1, Math.min(1, buffer[i])) * 0x7fff;
  }
  return int16.buffer;
}

// <div>
//   <button onClick={isRecording ? stopRecording : startRecording}>
//     {isRecording ? "Stop" : "Speak"}
//   </button>
// </div>;
