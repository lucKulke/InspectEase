"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ChevronDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IUserProfileResponse } from "@/lib/database/public/publicInterface";

type Props = {
  isBeeingEdited: { activeUsers: number } | null;
  currentUsers: IUserProfileResponse[];
  teamMemberProfilePictures: Record<string, string>;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  type?: "fixed" | "absolute";
};

export default function UserIndicatorOverlay({
  isBeeingEdited,
  currentUsers,
  teamMemberProfilePictures,
  position = "top-right",
  type = "fixed",
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOverlayClick = () => setIsExpanded(!isExpanded);

  if (!isBeeingEdited || currentUsers.length === 0) return null;

  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("");

  return (
    <div className={`${type} z-10 ${positionClasses[position]}`}>
      <motion.div
        className="bg-blue-500 text-white rounded-lg shadow-lg overflow-hidden"
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Collapsed State */}
        <motion.div
          className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-blue-600 transition-colors"
          onClick={handleOverlayClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex -space-x-1">
            {currentUsers.slice(0, 3).map((user) => (
              <Avatar
                key={user.user_id}
                className="h-5 w-5 border border-white"
              >
                <AvatarImage
                  src={teamMemberProfilePictures[user.user_id]}
                  alt={user.first_name}
                />
                <AvatarFallback className="text-xs bg-blue-600 text-white">
                  {getInitials(
                    user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.email
                  )}
                </AvatarFallback>
              </Avatar>
            ))}
            {isBeeingEdited.activeUsers > 3 && (
              <div className="h-5 w-5 bg-blue-700 rounded-full border border-white flex items-center justify-center">
                <span className="text-xs font-bold">
                  +{isBeeingEdited.activeUsers - 3}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span className="text-xs font-medium">
              {currentUsers.length === 1
                ? "1 user"
                : `${currentUsers.length} users`}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-3 w-3" />
            </motion.div>
          </div>
        </motion.div>

        {/* Expanded State */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-blue-400"
            >
              <div className="p-2 space-y-2 max-h-48 overflow-y-auto">
                {currentUsers.map((user, index) => (
                  <motion.div
                    key={user.user_id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.2 }}
                    className="flex items-center gap-2 p-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={teamMemberProfilePictures[user.user_id]}
                        alt={user.first_name}
                      />
                      <AvatarFallback className="text-xs bg-blue-600 text-white">
                        {getInitials(`${user.first_name} ${user.last_name}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-medium truncate">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="text-xs opacity-75 truncate">
                        {user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-green-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs">Active</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
