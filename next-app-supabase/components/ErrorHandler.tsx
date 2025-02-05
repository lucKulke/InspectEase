"use client";
import { useNotification } from "@/app/context/NotificationContext";
import { SupabaseError } from "@/lib/globalInterfaces";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

interface ErrorHandlerProps {
  error: SupabaseError;
}

export const ErrorHandler = ({ error }: ErrorHandlerProps) => {
  const { showNotification } = useNotification();

  useEffect(() => {
    if (error) {
      showNotification(
        "Fetch Object",
        `Error: ${error.message} (${error.code})`,
        "error"
      );
      //redirect(formBuilderLinks["inspectableObjects"].href);
    }
  }, []);

  return (
    <div className="flex justify-center">
      Big Error. Please try again later...
    </div>
  );
};
