"use client";
import { useNotification } from "@/app/context/NotificationContext";
import { SupabaseError } from "@/lib/globalInterfaces";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { redirect } from "next/navigation";
import React from "react";

interface ErrorHandlerProps {
  errors: SupabaseError[];
}

export const ErrorHandler = ({ errors }: ErrorHandlerProps) => {
  const { showNotification } = useNotification();

  errors.forEach((error) => {
    if (error) {
      showNotification(
        "Fetch Object",
        `Error: ${error.message} (${error.code})`,
        "error"
      );
      //redirect(formBuilderLinks["inspectableObjects"].href);
    }
  });

  return <></>;
};
