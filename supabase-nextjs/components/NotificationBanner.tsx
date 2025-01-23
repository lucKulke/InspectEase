// components/NotificationBanner.tsx
"use client";
import React from "react";
import { useNotification } from "@/app/context/NotificationContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
// CSS Module for styling

const NotificationBanner: React.FC = () => {
  const { notification, hideNotification } = useNotification();

  if (!notification) return null;

  const bannerClasses = {
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500 text-black",
  };

  return (
    <div
      className="fixed top-2 left-1/4 right-1/4 p-4 "
      onClick={hideNotification}
    >
      <Alert className={bannerClasses[notification.type]}>
        <Terminal className="h-4 w-4 " />
        <AlertTitle>{notification.title}</AlertTitle>
        <AlertDescription>{notification.message}</AlertDescription>
      </Alert>
    </div>
  );
};

export default NotificationBanner;
