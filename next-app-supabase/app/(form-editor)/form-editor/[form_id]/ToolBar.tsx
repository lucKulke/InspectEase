import React from "react";
import { Home, Search, PlusCircle, User, Blocks, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface ToolBarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export const ToolBar = ({ activeTab, setActiveTab }: ToolBarProps) => {
  const toggleTab = () => {
    setActiveTab((prevTab) => (prevTab === "Editor" ? "Document" : "Editor"));
  };
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white shadow-lg px-6 py-3 rounded-2xl border border-gray-200">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="p-2 text-gray-600 hover:text-black transition">
            <Home size={24} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="top" className="mb-2">
          <DropdownMenuItem onClick={() => console.log("Dashboard Clicked")}>
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => console.log("Settings Clicked")}>
            Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AnimatePresence mode="wait">
        <motion.ul
          key={activeTab} // Ensures re-animation on change
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center bg-gray-200 rounded-full p-2 shadow-lg">
            <button
              onClick={toggleTab}
              className={`px-4 py-2 rounded-full transition flex items-center ${
                activeTab === "Editor"
                  ? "bg-blue-500 text-white"
                  : "bg-transparent text-gray-500"
              }`}
            >
              <Blocks className="text-xl" />
            </button>
            <button
              onClick={toggleTab}
              className={`px-4 py-2 rounded-full transition flex items-center ${
                activeTab === "Document"
                  ? "bg-blue-500 text-white"
                  : "bg-transparent text-gray-500"
              }`}
            >
              <FileText className="text-xl" />
            </button>
          </div>
        </motion.ul>
      </AnimatePresence>
    </div>
  );
};
