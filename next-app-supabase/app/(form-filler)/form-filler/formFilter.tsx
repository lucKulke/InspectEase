"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IFillableFormPlusFillableFields } from "@/lib/database/form-filler/formFillerInterfaces";
import { FormCard } from "./formCard";
import { useNotification } from "@/app/context/NotificationContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ActiveForm } from "@/lib/globalInterfaces";
import { useRouter, useSearchParams } from "next/navigation";
import { UUID } from "crypto";
import { deleteForms } from "./actions";
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

interface FormFilterProps {
  forms: IFillableFormPlusFillableFields[] | null;
  wsUrl: string;
}

export const FormFilter = ({ forms, wsUrl }: FormFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "inProgress");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isConnected } = useWebSocket<ActiveForm[]>(wsUrl);
  const [activeForms, setActiveForms] = useState<ActiveForm[]>([]);
  const { showNotification } = useNotification();

  const [fillableForms, setFillableForms] = useState<
    IFillableFormPlusFillableFields[]
  >(forms || []);
  const [selectedForm, setSelectedForm] = useState<UUID>();
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);

  useEffect(() => {
    if (tabFromUrl !== activeTab) {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set("tab", activeTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [activeTab]);

  useEffect(() => {
    if (data) {
      setActiveForms(data);
    }
  }, [data]);

  const handleDeleteForms = async (formIds: string[]) => {
    setFillableForms((prev) =>
      prev.filter((form) => !formIds.includes(form.id))
    );
    const { deletedForm, deletedFormError } = await deleteForms(
      formIds as UUID[]
    );
    if (deletedFormError) {
      return showNotification(
        "Delete form",
        `Error: ${deletedFormError.message} (${deletedFormError.code})`,
        "error"
      );
    } else if (deletedForm) {
      showNotification("Delete form", `Successfully deleted forms `, "info");
    }
  };

  const compare = (
    a: IFillableFormPlusFillableFields,
    b: IFillableFormPlusFillableFields
  ) => {
    if (a.updated_at > b.updated_at) return -1;
    if (a.updated_at < b.updated_at) return 1;
    return 0;
  };

  // Filter forms based on search input
  const filteredForms = fillableForms.filter((form) =>
    form.identifier_string.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="md:flex md:justify-between">
          <TabsList className="mb-6">
            <TabsTrigger value="inProgress">In-progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <input
            type="text"
            placeholder="Search by identifier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-6 w-30 rounded-md border px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <TabsContent value="inProgress" className="w-full">
          {filteredForms.filter((form) => form.in_progress).sort(compare)
            .length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No matching in-progress forms
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
              {filteredForms
                .filter((form) => form.in_progress)
                .sort(compare)
                .map((form) => (
                  <FormCard
                    isBeeingEdited={activeForms}
                    key={form.id}
                    form={form}
                    selectedForm={selectedForm}
                    setSelectedForm={setSelectedForm}
                    setOpenAlertDialog={setOpenAlertDialog}
                    setFillableForms={setFillableForms}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="w-full">
          {filteredForms.filter((form) => !form.in_progress).sort(compare)
            .length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No matching completed forms
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
              {filteredForms
                .filter((form) => !form.in_progress)
                .sort(compare)
                .map((form) => (
                  <FormCard
                    isBeeingEdited={activeForms}
                    key={form.id}
                    form={form}
                    selectedForm={selectedForm}
                    setSelectedForm={setSelectedForm}
                    setOpenAlertDialog={setOpenAlertDialog}
                    setFillableForms={setFillableForms}
                  />
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
                if (selectedForm) handleDeleteForms([selectedForm]);
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
