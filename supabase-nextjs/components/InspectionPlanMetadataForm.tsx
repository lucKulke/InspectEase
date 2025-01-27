"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { useNotification } from "@/app/context/NotificationContext";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { DBActions } from "@/lib/dbActions";
import { extractAnnotations } from "@/lib/pdfTools";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const carSchema = z.object({
  type: z.enum(["tbm", "kbm"], {
    required_error: "Please select a vehicle type.",
  }),
  name: z.string().min(1, "Make is required"),
  description: z.string().min(1, "Model is required"),
  frequency: z.string().min(1, "HSN is required"),
  file: z
    .any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .pdf files are accepted."
    ),
});

type MetadataFormValues = z.infer<typeof carSchema>;

interface InspectionPlanMetadataCardProps {
  vehicle_id: string;
}

interface AnnotationRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface AnnotationData {
  contents: string;
  pageNumber: number;
  rect: AnnotationRect;
  type: "FreeText"; // You can extend this to support more types if necessary
}

interface AnnotationsResponse {
  annotations: AnnotationData[];
  filename: string;
  status: string;
}

export default function InspectionPlanMetadataCard({
  vehicle_id,
}: InspectionPlanMetadataCardProps) {
  const supabase = createClient();
  const dbActions = new DBActions(supabase);
  const { showNotification } = useNotification();

  const router = useRouter();

  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      type: undefined,
      name: "",
      description: "",
      frequency: "",
    },
  });

  function hasDuplicateAnnotations(annotations: AnnotationData[]): boolean {
    const seenContents: Set<string> = new Set();

    for (const annotation of annotations) {
      if (seenContents.has(annotation.contents)) {
        // If the contents have been seen before, it's a duplicate
        return true;
      }
      seenContents.add(annotation.contents);
    }

    // No duplicates found
    return false;
  }

  async function onSubmit(formData: MetadataFormValues) {
    console.log(formData);

    const form = new FormData();
    form.append("file", formData.file);

    try {
      // Step 1: Extract annotations from the uploaded file
      const response = await fetch("/api/uploadInspectionPlan", {
        method: "POST",
        body: form,
      });

      const data: AnnotationsResponse = await response.json();

      if (response.ok) {
        // Step 2: Check for duplicate annotations
        if (hasDuplicateAnnotations(data.annotations)) {
          showNotification(
            "Inspection Plan",
            "The document has duplicate annotation ids...",
            "error"
          );
          return;
        }

        // Step 3: Construct metadata with annotations as JSON
        const metadata = {
          vehicle_id: vehicle_id,
          type: formData.type,
          name: formData.name,
          description: formData.description,
          frequency: formData.frequency,
          annotations: data.annotations,
        };

        // Step 4: Add metadata and file to FormData
        const combinedForm = new FormData();
        combinedForm.append("metadata", JSON.stringify(metadata));
        combinedForm.append("file", formData.file);

        // Step 5: Send the combined payload to the Server
        const finalResponse = await fetch(
          `/studio/vehicle/${vehicle_id}/new_inspection_plan/create`,
          {
            method: "POST",
            body: combinedForm,
          }
        );

        if (finalResponse.ok) {
          showNotification(
            "Inspection Plan",
            "Inspection plan created successfully!",
            "info"
          );
          router.push(`/studio/vehicle/${vehicle_id}`);
        } else {
          // Attempt to parse the error message from the response
          try {
            const errorData = await finalResponse.json(); // Parse JSON response
            showNotification(
              "Inspection Plan",
              errorData.error || "An unexpected error occurred",
              "error"
            );
          } catch (e) {
            console.error("Failed to parse error response:", e);
            showNotification(
              "Inspection Plan",
              "An unexpected error occurred while processing your request",
              "error"
            );
          }
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      showNotification("Inspection Plan", "An error occurred.", "error");
    }
  }

  return (
    <Card className="w-1/2">
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
        <CardDescription>Enter the inspection plan's metadata.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance interval type</FormLabel>
                  <div className="relative">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tbm">
                          Time-Based Maintenance
                        </SelectItem>
                        <SelectItem value="kbm">
                          Kilometer-Based Maintenance
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormDescription>
                    Select the maintenance type of the inspection plan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspection name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Annual Safety" {...field} />
                  </FormControl>
                  <FormDescription>The name of the inspection</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Getriebe und Bremse inkl"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The description of the inspection plan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 10000" {...field} />
                  </FormControl>
                  <FormDescription>The frequency.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel>
                    Upload annotated inspection plan ( only PDF)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      onBlur={onBlur}
                      name={name}
                      ref={ref}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload the inspection plan PDF (max 5MB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center mt-5">
              <Button type="submit">Submit Metadata + PDF</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
