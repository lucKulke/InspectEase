import React from "react";
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
  return (
    <div className="m-4 p-2 border-2 rounded-xl">
      <Popover>
        <PopoverTrigger className="flex items-center">
          {profileIcons[currentIcon]}
        </PopoverTrigger>
        <PopoverContent className="w-24">
          <div className="grid grid-cols-2">
            {Object.entries(profileIcons).map(([key, icon]) => (
              <button key={key} onClick={() => onSelect(key as IconType)}>
                {icon}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
