"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IFillableFormResponse } from "@/lib/database/form-filler/formFillerInterfaces";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { UUID } from "crypto";
import { format } from "date-fns";
import { FormCard } from "./formCard";

interface FormFilterProps {
  forms: IFillableFormResponse[] | null;
}

export const FormFilter = ({ forms }: FormFilterProps) => {
  if (!forms) return <div>No forms yet</div>;
  const [activeTab, setActiveTab] = useState("inProgress");

  const [formsInProgress, setFormsInProgress] = useState<
    IFillableFormResponse[]
  >(forms.filter((form) => form.in_progress === true));

  const [formsCompleted, setFormsCompleted] = useState<IFillableFormResponse[]>(
    forms.filter((form) => form.in_progress === false)
  );

  async function fetchCurrentProgress(formId: UUID) {}

  return (
    <div className="container mx-auto px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="inProgress">In-progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="inProgress" className="w-full">
          {formsInProgress.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No in-progress forms available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formsInProgress.map((form) => (
                <FormCard key={form.id} form={form}></FormCard>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="w-full">
          {formsCompleted.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No completed forms available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formsCompleted.map((form) => (
                <FormCard key={form.id} form={form}></FormCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
