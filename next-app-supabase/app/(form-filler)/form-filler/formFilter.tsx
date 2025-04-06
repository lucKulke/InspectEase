"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export const FormFilter = () => {
  const [activeTab, setActiveTab] = useState("inProgress");
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="">
          <TabsTrigger value="inProgress">In-progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="inProgress"></TabsContent>
        <TabsContent value="completed"></TabsContent>
      </Tabs>
    </div>
  );
};
