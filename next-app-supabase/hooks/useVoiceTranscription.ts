import { useCallback, useEffect, useRef, useState } from "react";
import {
  useDeepgram,
  LiveTranscriptionEvents,
  LiveTranscriptionEvent,
  LiveConnectionState,
} from "@/app/context/DeepgramContextProvider";
import {
  useMicrophone,
  MicrophoneEvents,
  MicrophoneState,
} from "@/app/context/MicrophoneContextProvider";

interface UseVoiceTranscriptionParams {
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  processAiResposne: (input: string) => Promise<void>;
}

export const useVoiceTranscription = ({
  userInput,
  setUserInput,
  processAiResposne,
}: UseVoiceTranscriptionParams) => {
  const [isRecording, setIsRecording] = useState(false);
  const captionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepAliveInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    connection,
    connectToDeepgram,
    disconnectFromDeepgram,
    connectionState,
  } = useDeepgram();
  const {
    microphone,
    setupMicrophone,
    startMicrophone,
    stopMicrophone,
    microphoneState,
  } = useMicrophone();

  const startTranscription = useCallback(async () => {
    await stopTranscription();
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
  }, [setupMicrophone, connectToDeepgram]);

  const stopTranscription = useCallback(async () => {
    if (microphoneState === MicrophoneState.Open) {
      stopMicrophone();
    }
    if (connectionState !== LiveConnectionState.CLOSED) {
      await disconnectFromDeepgram();
    }
    if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    if (captionTimeout.current) clearTimeout(captionTimeout.current);
  }, [
    microphoneState,
    connectionState,
    stopMicrophone,
    disconnectFromDeepgram,
  ]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopTranscription();
      setIsRecording(false);

      await processAiResposne(userInput);
    } else {
      setUserInput("");
      await startTranscription();
    }
  }, [isRecording, userInput]);

  useEffect(() => {
    if (
      !microphone ||
      !connection ||
      connectionState !== LiveConnectionState.OPEN
    )
      return;

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0 && connection.getReadyState() === 1) {
        connection.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const transcript = data.channel.alternatives[0].transcript;
      if (!transcript) return;

      console.log("data", data);
      if (data.is_final && data.speech_final) {
        setUserInput((prev) => prev + transcript + " ");
        if (captionTimeout.current) clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {}, 3000);
      }
    };

    connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
    microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);
    startMicrophone();

    keepAliveInterval.current = setInterval(() => {
      connection.keepAlive();
    }, 10000);

    return () => {
      connection.removeListener(
        LiveTranscriptionEvents.Transcript,
        onTranscript
      );
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      if (captionTimeout.current) clearTimeout(captionTimeout.current);
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };
  }, [connectionState, microphone]);

  return { isRecording, toggleRecording };
};
