"use client";
import React, { useState } from "react";
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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import {
  FillableFormsMetadata,
  InspectionPlan,
  Vehicle,
} from "@/lib/interfaces";
import { useNotification } from "@/app/context/NotificationContext";
import { redirect } from "next/navigation";

const fillableFormSchema = z.object({
  vehicle: z.string().nonempty("Please select a vehicle."),
  inspectionPlan: z.string().nonempty("Please select a inspection plan."),
  orderNumber: z.string(),
});

type MetadataFormValues = z.infer<typeof fillableFormSchema>;

interface FillableFormCreateCardProps {
  availableVehicles: Vehicle[];
  fetchInspectionPlans: (vehicleId: string) => Promise<{
    inspectionPlans: InspectionPlan[];
    inspectionPlansError: any;
  }>;
  createFillableForm: (formData: {
    orderNumber: string;
    inspectionPlanId: string;
  }) => Promise<{
    fillableForm: FillableFormsMetadata;
    fillableFormError: any;
  }>;
}

const FillableFormCreateCard = ({
  availableVehicles,
  fetchInspectionPlans,
  createFillableForm,
}: FillableFormCreateCardProps) => {
  const { showNotification } = useNotification();

  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [inspectionPlans, setInspectionPlans] = useState<InspectionPlan[]>([]);

  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(fillableFormSchema),
    defaultValues: {
      vehicle: undefined,
      inspectionPlan: undefined,
      orderNumber: "",
    },
  });

  const handleVehicleChange = async (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    const { inspectionPlans, inspectionPlansError } = await fetchInspectionPlans(vehicleId);
    setInspectionPlans(inspectionPlans);
  };

  async function onSubmit(formData: MetadataFormValues) {
    console.log("Form submitted:", formData);
    const { fillableForm, fillableFormError } = await createFillableForm({
      orderNumber: formData.orderNumber,
      inspectionPlanId: formData.inspectionPlan,
    });

    if (fillableFormError) {
      showNotification("Fillable form", `Error: ${fillableFormError}`, "error");
    } else {
      redirect("/fill_forms");
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
              name="orderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 1ABASD343" {...field} />
                  </FormControl>
                  <FormDescription>The order number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehicle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select vehicle</FormLabel>
                  <div className="relative">
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleVehicleChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
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

            {selectedVehicle && (
              <FormField
                control={form.control}
                name="inspectionPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Inspection Plan</FormLabel>
                    <div className="relative">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an inspection plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {inspectionPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.inspection_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormDescription>
                      Select the specific inspection plan for the vehicle.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-center mt-5">
              <Button type="submit">Submit Metadata</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FillableFormCreateCard;
