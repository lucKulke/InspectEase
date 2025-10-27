import { IUserProfileResponse } from "@/lib/database/public/publicInterface";
import { UUID } from "crypto";
import React, { useEffect, useRef, useState } from "react";
import { ColorPicker } from "./ColorPicker";
import { cn } from "@/lib/utils";
import { Mic, Square, Camera, StickyNote, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActionBarProps {
  disabled: boolean;
  currentUser: IUserProfileResponse | undefined;
  involvedUsers: (IUserProfileResponse | undefined)[];
  onColorChange: (color: string) => void;
  profilePictures: Record<UUID, string | undefined>;
}

export const ActionBar = ({
  disabled,
  profilePictures,
  currentUser,
  involvedUsers,
  onColorChange,
}: ActionBarProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Camera lifecycle ---
  useEffect(() => {
    const start = async () => {
      try {
        setCameraError(null);
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error(err);
        setCameraError("Could not access camera. Check permissions.");
      }
    };

    if (showCamera) start();

    return () => {
      if (!showCamera) return;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [showCamera]);

  const handleOpenCamera = () => {
    setShowCamera((s) => !s);
    //onOpenCamera?.();
  };

  const handleCreateNote = () => {
    //onCreateNote?.();
    // You can navigate/open your note composer here if no callback is provided.
  };

  // --- Motion variants ---
  const trayVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 260, damping: 24 },
    },
  } as const;

  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 8 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 18 },
    },
  } as const;
  return (
    <div className="fixed bottom-4 flex w-full items-center justify-between">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={trayVariants}
        className={cn(
          "group inline-flex items-center gap-2 rounded-full border border-gray-200/60 bg-white/80 p-2 shadow-xl backdrop-blur-xl",
          "dark:border-zinc-800/60 dark:bg-zinc-900/70"
        )}
        aria-label="Quick actions toolbar"
      >
        <motion.div variants={listVariants} className="flex items-center gap-2">
          {/* Camera */}
          <motion.button
            type="button"
            variants={itemVariants}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleOpenCamera}
            disabled={disabled}
            className={cn(
              "group/button relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm",
              "transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500",
              "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label={showCamera ? "Hide camera" : "Open camera"}
          >
            <Camera className="h-5 w-5" />
            {/* ripple */}
            <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition group-hover/button:opacity-100 [box-shadow:0_0_0_12px_rgba(59,130,246,0.1)]" />
            {/* label */}
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-7 text-[11px] font-medium text-gray-600 dark:text-zinc-300"
            >
              Camera
            </motion.span>
          </motion.button>

          {/* Create Note */}
          <motion.button
            type="button"
            variants={itemVariants}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleCreateNote}
            disabled={disabled}
            className={cn(
              "group/button relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm",
              "transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500",
              "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Create note"
          >
            <StickyNote className="h-5 w-5" />
            <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition group-hover/button:opacity-100 [box-shadow:0_0_0_12px_rgba(16,185,129,0.12)]" />
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-7 text-[11px] font-medium text-gray-600 dark:text-zinc-300"
            >
              Note
            </motion.span>
          </motion.button>
        </motion.div>
      </motion.div>

      <div className="">
        <button
          onClick={() => {}}
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
      <ColorPicker
        profilePictures={profilePictures}
        disabled={false}
        currentUser={currentUser}
        teammates={involvedUsers}
        onColorChange={onColorChange}
      />
    </div>
  );
};
