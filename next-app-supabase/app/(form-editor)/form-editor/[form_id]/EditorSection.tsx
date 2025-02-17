"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React from "react";

interface EditorSectionProps {
  children: React.ReactNode;
}

export const EditorSection = ({ children }: EditorSectionProps) => {
  return (
    <div className="mt-6 h-screen">
      <Tabs defaultValue="Editor" className="w-full">
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-2 w-1/2">
            <TabsTrigger value="Editor">Editor</TabsTrigger>
            <TabsTrigger value="Document">Document (PDF)</TabsTrigger>
          </TabsList>
        </div>
        {children}
      </Tabs>
      <div className=""></div>
    </div>
  );
};
