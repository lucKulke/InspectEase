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
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="">
          <TabsTrigger value="inProgress">In-progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="inProgress">
          {formsInProgress.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <CardTitle>
                  <Link href={"/form/" + form.id}>{form.id}</Link>
                </CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed"></TabsContent>
      </Tabs>
    </div>
  );
};
