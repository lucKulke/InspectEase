"use client";

import { useState } from "react";
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

// Mock data - replace with your actual data source
const mockTeammates = [
  {
    id: "1",
    first_name: "Alice",
    last_name: "Johnson",
    color: "#ef4444",
    initials: "AJ",
  },
  {
    id: "2",
    first_name: "Moin",
    last_name: "Servus",
    color: "#3b82f6",
    initials: "BS",
  },
];

const colorOptions = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
];

interface ColorPickerProps {
  currentUser: IUserProfileResponse | undefined;
  teammates: (IUserProfileResponse | undefined)[];
  onColorChange: (color: string) => void;
}

export const ColorPicker = ({
  currentUser,
  teammates,
  onColorChange,
}: ColorPickerProps) => {
  if (!currentUser) {
    return null;
  }
  const [isExpanded, setIsExpanded] = useState(false);
  const [userColor, setUserColor] = useState(currentUser.color);
  console.log("team mates", teammates);

  const handleColorChange = (color: string) => {
    setUserColor(color);
    onColorChange?.(color);
  };
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("");

  //const allMembers = [{ ...currentUser, color: userColor }, ...teammates];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Expanded team view */}
      {isExpanded && (
        <Card className="mb-2 w-64 animate-in slide-in-from-bottom-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              <span className="font-medium text-sm">Team Members</span>
            </div>
            <div className="space-y-2">
              {teammates.map((member) => (
                <div key={member?.user_id} className="flex items-center gap-3">
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main widget */}
      <Card className="shadow-lg">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            {/* Color picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: userColor ?? undefined }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="end" side="top">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-4 w-4" />
                  <span className="font-medium text-sm">Choose your color</span>
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform",
                        userColor === color &&
                          "ring-2 ring-gray-400 ring-offset-1"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Team toggle button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center gap-1">
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
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
