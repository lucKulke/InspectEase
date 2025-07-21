"use client";
import { Check, PaintBucket } from "lucide-react";
import { useState } from "react";
import { ChromePicker } from "react-color";

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
  originalColor: string;
}

export const ColorPicker = ({
  onColorSelect,
  originalColor,
}: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState(originalColor);

  const handleChange = (colorResult: any) => {
    setColor(colorResult.hex);
  };

  const handleToggle = () => {
    if (isOpen) {
      // Confirm the selected color when clicking the tick
      console.log(color);
      onColorSelect(color);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 shadow-lg rounded-lg overflow-hidden bg-white">
          <ChromePicker color={color} onChange={handleChange} />
        </div>
      )}

      <button
        style={{
          backgroundColor: color || "#ffffff",
        }}
        className={`w-14 h-14  text-white rounded-full shadow-lg flex items-center justify-center text-xl transition-all`}
        onClick={handleToggle}
      >
        {isOpen ? (
          <Check className={`${color === "#ffffff" && "text-black"}`}></Check>
        ) : (
          <PaintBucket
            className={`${color === "#ffffff" && "text-black"}`}
          ></PaintBucket>
        )}
      </button>
    </div>
  );
};
