"use client";

import { useEffect, useRef, useState } from "react";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "@/app/context/DeepgramContextProvider";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "@/app/context/MicrophoneContextProvider";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputV2Props {
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  userInput: string;
  processAiResposne: (userInput: string) => Promise<void>;
  setTranscribing: React.Dispatch<React.SetStateAction<boolean>>;
  isThinking: boolean;
}

export const VoiceInputV2 = ({
  setUserInput,
  userInput,
  processAiResposne,
  setTranscribing,
  isThinking,
}: VoiceInputV2Props) => {
  const [isRecording, setIsRecording] = useState(false);

  const {
    connection,
    connectToDeepgram,
    disconnectFromDeepgram,
    connectionState,
  } = useDeepgram();
  const {
    setupMicrophone,
    microphone,
    startMicrophone,
    stopMicrophone,
    microphoneState,
  } = useMicrophone();

  const captionTimeout = useRef<any>(null);
  const keepAliveInterval = useRef<any>(null);

  const startTranscription = async () => {
    await stopTranscription(); // Ensure any old streams/connections are cleaned
    setupMicrophone();
    await connectToDeepgram({
      model: "nova-3",
      interim_results: true,
      smart_format: true,
      filler_words: true,
      utterance_end_ms: 3000,
      language: "multi",
    });
    setIsRecording(true);
  };

  const stopTranscription = async () => {
    if (microphoneState === MicrophoneState.Open) {
      stopMicrophone();
    }
    if (connectionState !== LiveConnectionState.CLOSED) {
      await disconnectFromDeepgram?.();
    }
    clearInterval(keepAliveInterval.current);
    clearTimeout(captionTimeout.current);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopTranscription();
      setIsRecording(false);
      setTranscribing(false);
      processAiResposne(userInput);
    } else {
      setUserInput("");
      await startTranscription();
    }
  };

  useEffect(() => {
    if (!microphone || !connection) return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0 && connection.getReadyState() === 1) {
        connection.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      const thisCaption = data.channel.alternatives[0].transcript;

      if (!thisCaption) return;

      if (isFinal && speechFinal) {
        // Finale Transkripte dauerhaft übernehmen
        setUserInput((prev) => prev + thisCaption + " ");

        // Temporäres Caption nach Timeout entfernen
        clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {}, 3000);
      } else {
        // Temporäre Anzeige von Partials
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
      startMicrophone();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    }

    return () => {
      connection?.removeListener(
        LiveTranscriptionEvents.Transcript,
        onTranscript
      );
      microphone?.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
      clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState, microphone]);

  return (
    <button
      disabled={isThinking}
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
