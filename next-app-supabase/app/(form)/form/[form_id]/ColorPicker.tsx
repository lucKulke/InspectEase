"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Users, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { IUserProfileResponse } from "@/lib/database/public/publicInterface";

const colorOptions = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

interface ColorPickerProps {
  disabled: boolean;
  currentUser: IUserProfileResponse | undefined;
  teammates: (IUserProfileResponse | undefined)[];
  onColorChange: (color: string) => void;
}

export const ColorPicker = ({
  disabled,
  currentUser,
  teammates,
  onColorChange,
}: ColorPickerProps) => {
  if (!currentUser) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const [userColor, setUserColor] = useState(currentUser.color);

  const handleColorChange = (color: string) => {
    setUserColor(color);
    onColorChange?.(color);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("");

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Expanded team view with AnimatePresence */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="mb-2 w-64 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4" />
                  <span className="font-medium text-sm">Team Members</span>
                </div>
                <motion.div
                  className="space-y-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.05 },
                    },
                  }}
                >
                  {teammates.map((member) => (
                    <motion.div
                      key={member?.user_id}
                      className="flex items-center gap-3"
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 },
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: member?.color ?? undefined }}
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarFallback
                          className="text-xs"
                          style={{
                            backgroundColor: member?.color ?? undefined,
                            color: "white",
                          }}
                        >
                          {getInitials(
                            member?.first_name + " " + member?.last_name
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm flex-1 truncate">
                        {member?.user_id === currentUser.user_id
                          ? "You"
                          : member?.email}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main widget */}
      <Card className="shadow-lg">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            {/* Color picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  disabled={disabled}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <motion.div
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: userColor ?? undefined }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="end" side="top">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      Choose your color
                    </span>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {colorOptions.map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 border-white shadow-sm",
                          userColor === color &&
                            "ring-2 ring-gray-400 ring-offset-1"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                      />
                    ))}
                  </div>
                </motion.div>
              </PopoverContent>
            </Popover>

            {/* Team toggle button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <motion.div
                className="flex items-center gap-1"
                whileTap={{ scale: 0.95 }}
              >
                <Users className="h-4 w-4" />
                <div className="flex -space-x-1">
                  {teammates &&
                    teammates.slice(0, 3).map((member, index) => (
                      <div
                        key={member?.user_id}
                        className="w-3 h-3 rounded-full border border-white"
                        style={{
                          backgroundColor: member?.color ?? undefined,
                          zIndex: teammates && teammates.length - index,
                        }}
                      />
                    ))}
                  {teammates && teammates.length > 3 && (
                    <div className="w-3 h-3 rounded-full bg-gray-400 border border-white flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">
                        +{teammates && teammates.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
