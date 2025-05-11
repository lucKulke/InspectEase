"use client";

import { useRef, useState } from "react";

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const base64 = await blobToBase64(audioBlob);
      await sendToApi(base64);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const cleaned = base64data.split(",")[1]; // remove "data:audio/webm;base64,"
        resolve(cleaned);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendToApi = async (base64: string) => {
    try {
      const res = await fetch("http://localhost:8000/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio_base64: base64 }),
      });

      const data = await res.json();
      if (res.ok) {
        setTranscript(data.transcription);
      } else {
        setTranscript("Error: " + data.detail);
      }
    } catch (err) {
      setTranscript("Failed to reach server.");
    }
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">Voice Recorder</h2>
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        className={`px-4 py-2 rounded text-white ${
          isRecording ? "bg-red-500" : "bg-green-600"
        }`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <div className="mt-4">
        <h3 className="font-semibold">Transcript:</h3>
        <p className="whitespace-pre-wrap">{transcript}</p>
      </div>
    </div>
  );
}
