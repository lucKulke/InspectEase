// components/Bar.tsx
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ApiResponse, transcribeAudio } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type RecordingItem = {
  id: string;
  audioBlob: Blob;
  status: "queued" | "transcribing" | "processing" | "done" | "error" | "empty";
  transcript?: string;
  intentResult?: string;
};

const statusCodeDescriptions = {
  0: "Success",
  1: "Missing API Key",
  2: "Provider Error",
  3: "Unknown Error",
};
export function useQueueProcessor(
  queue: RecordingItem[],
  setQueue: React.Dispatch<React.SetStateAction<RecordingItem[]>>,

  proccessTranscript: (userInput: string) => Promise<ApiResponse | false>
) {
  useEffect(() => {
    const current = queue.find((item) => item.status === "queued");
    if (!current) return;

    const processRecording = async (item: RecordingItem) => {
      updateStatus(item.id, "transcribing");
      const transcript = await transcribeAudio("deepgram", item.audioBlob);
      console.log("transcript", transcript);
      if (transcript.statusCode !== 0) {
        updateStatus(item.id, "error");
        setTimeout(() => removeItem(item.id), 3000);
        return;
      }

      if (transcript.text.length < 1) {
        updateStatus(item.id, "empty");
        setTimeout(() => removeItem(item.id), 3000);
        return;
      }

      // Replace with your transcription logic
      updateItem(item.id, { transcript: transcript.text });

      updateStatus(item.id, "processing");
      const intent = await proccessTranscript(transcript.text);
      if (!intent) {
        updateItem(item.id, { intentResult: "nothing" });
        updateStatus(item.id, "done");
        setTimeout(() => removeItem(item.id), 2000);
        return;
      }
      const filledOutFields =
        intent.checkboxes
          .map((box) => box.label + ": " + box.checked)
          .join("\n") +
        "\n" +
        intent.textInputFields.map((field) => field.id + ": " + field.value); // Replace with your intent recognition
      updateItem(item.id, { intentResult: filledOutFields });

      updateStatus(item.id, "done");
      setTimeout(() => removeItem(item.id), 5000);
    };

    const updateStatus = (id: string, status: RecordingItem["status"]) => {
      setQueue((q) =>
        q.map((item) => (item.id === id ? { ...item, status } : item))
      );
    };

    const updateItem = (id: string, update: Partial<RecordingItem>) => {
      setQueue((q) =>
        q.map((item) => (item.id === id ? { ...item, ...update } : item))
      );
    };

    const removeItem = (id: string) => {
      setQueue((q) => q.filter((item) => item.id !== id));
    };

    processRecording(current);
  }, [queue]);
}

export function QueueLog({ queue }: { queue: RecordingItem[] }) {
  const [hovered, setHovered] = useState(false);

  const collapsedOffset = 16; // px between stacked items

  return (
    <motion.div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[420px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative transition-all duration-300">
        {queue.map((item, index) => {
          const isCollapsed = !hovered;
          const topOffset = isCollapsed ? index * collapsedOffset : index * 100; // 80px per card height when expanded

          return (
            <motion.div
              key={item.id}
              layout
              transition={{ duration: 0.3, type: "spring" }}
              className={`absolute w-full rounded-xl  shadow-md p-3 text-sm overflow-hidden border-2 ${
                item.status === "error" ? "bg-red-500 text-white" : "bg-white"
              } ${item.status === "empty" && "bg-yellow-500"}`}
              style={{
                top: topOffset,
                zIndex: queue.length - index,
              }}
              whileHover={{
                scale: 1.03,
              }}
            >
              <div className="font-semibold">Status: {item.status}</div>
              {item.status === "empty" ? (
                <div>No transcript</div>
              ) : (
                <>
                  <div>Transcript: {item.transcript}</div>
                  <div>Intent: {item.intentResult}</div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Bar({
  queue,
  setQueue,
}: {
  queue: RecordingItem[];
  setQueue: React.Dispatch<React.SetStateAction<RecordingItem[]>>;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const newItem: RecordingItem = {
          id: uuidv4(),
          audioBlob,
          status: "queued",
        };
        setQueue((q) => [...q, newItem]);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    }
  };

  //  Hook to listen to keyboard shortcut
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // ignore if focused in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        toggleRecording();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isRecording]);

  return (
    <div className="fixed bottom-0 w-full h-40 flex items-center justify-center">
      <button
        onClick={toggleRecording}
        className={cn(
          "flex items-center border-2 justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
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
    </div>
  );
}
