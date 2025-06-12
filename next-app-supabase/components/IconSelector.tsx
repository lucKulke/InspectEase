"use client";
import React, { useState } from "react";
import { CircleHelp } from "lucide-react";

import { Car, Truck, Bike, Bird } from "lucide-react";
import { IconType, profileIcons } from "@/lib/availableIcons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IconSelectorPorps {
  currentIcon: IconType;
  onSelect: (key: IconType) => void;
}

export const IconSelector = ({ onSelect, currentIcon }: IconSelectorPorps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="m-4 p-2 border-2 rounded-xl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="flex items-center">
          {profileIcons[currentIcon]}
        </PopoverTrigger>
        <PopoverContent className="w-24">
          <div className="grid grid-cols-2">
            {Object.entries(profileIcons).map(([key, icon]) => (
              <button
                key={key}
                onClick={() => {
                  onSelect(key as IconType);
                  setOpen(false);
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
