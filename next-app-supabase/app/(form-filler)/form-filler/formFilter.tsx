"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IFillableFormPlusFillableFields,
  IFillableFormResponse,
} from "@/lib/database/form-filler/formFillerInterfaces";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteForm } from "./actions";
import { useNotification } from "@/app/context/NotificationContext";

interface FormFilterProps {
  forms: IFillableFormPlusFillableFields[] | null;
}

export const FormFilter = ({ forms }: FormFilterProps) => {
  if (!forms) return <div>No forms yet</div>;
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("inProgress");

  const [fillableForms, setFillableForms] =
    useState<IFillableFormPlusFillableFields[]>(forms);

  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [selectedForm, setSelectedForm] = useState<UUID>();

  function compare(
    a: IFillableFormPlusFillableFields,
    b: IFillableFormPlusFillableFields
  ) {
    if (a.updated_at > b.updated_at) return -1;

    if (a.updated_at < b.updated_at) return 1;

    return 0;
  }

  const handleDeleteForm = async (formId: UUID) => {
    setFillableForms([...fillableForms].filter((form) => form.id !== formId));
    const { deletedForm, deletedFormError } = await deleteForm(formId);
    if (deletedFormError) {
      return showNotification(
        "Delete form",
        `Error: ${deletedFormError.message} (${deletedFormError.code})`,
        "error"
      );
    } else if (deletedForm) {
      return showNotification(
        "Delete form",
        `Successfully deleted form with id ${deletedForm.identifier_string}`,
        "info"
      );
    }
  };
  return (
    <div className="container mx-auto px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="inProgress">In-progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="inProgress" className="w-full">
          {fillableForms
            .sort(compare)
            .filter((form) => form.in_progress === true).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No in-progress forms available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fillableForms
                .filter((form) => form.in_progress === true)
                .map((form) => (
                  <FormCard
                    key={form.id}
                    form={form}
                    selectedForm={selectedForm}
                    setSelectedForm={setSelectedForm}
                    setOpenAlertDialog={setOpenAlertDialog}
                    setFillableForms={setFillableForms}
                  ></FormCard>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="w-full">
          {fillableForms.filter((form) => form.in_progress === false).length ===
          0 ? (
            <div className="text-center py-8 text-gray-500">
              No completed forms available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fillableForms
                .sort(compare)
                .filter((form) => form.in_progress === false)
                .map((form) => (
                  <FormCard
                    key={form.id}
                    form={form}
                    selectedForm={selectedForm}
                    setSelectedForm={setSelectedForm}
                    setOpenAlertDialog={setOpenAlertDialog}
                    setFillableForms={setFillableForms}
                  ></FormCard>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              fillable form with id{" "}
              {selectedForm && (
                <span className="font-bold">
                  {
                    fillableForms.filter((form) => form.id === selectedForm)[0]
                      ?.identifier_string
                  }
                </span>
              )}{" "}
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedForm) handleDeleteForm(selectedForm);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
