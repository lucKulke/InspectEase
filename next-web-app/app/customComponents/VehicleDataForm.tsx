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
import { Toast } from "@/components/ui/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useNotification } from "../context/NotificationContext";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const carSchema = z.object({
  type: z.enum(["car", "motorbike", "truck"], {
    required_error: "Please select a vehicle type.",
  }),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  hsn: z.string().min(1, "HSN is required"),
  tsn: z.string().min(1, "TSN is required"),
});

type VehicleFormValues = z.infer<typeof carSchema>;

export default function VehicleDataForm() {
  const { showNotification } = useNotification();

  const router = useRouter();

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      type: undefined,
      make: "",
      model: "",
      year: new Date().getFullYear(),
      hsn: "",
      tsn: "",
    },
  });

  async function onSubmit(formData: VehicleFormValues) {
    console.log(formData);
    const { data, error } = await supabase
      .from("vehicles")
      .insert([
        {
          type: formData.type,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          hsn: formData.hsn,
          tsn: formData.tsn,
        },
      ])
      .select();

    if (data) {
      console.log(data[0]);
      showNotification("New Vehicle", "successfully added new car", "info");
      router.push("/studio");
    }

    // Here you would typically send the data to your backend
  }

  return (
    <div className="p-2 flex justify-center">
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
          <CardDescription>
            Enter your vehicle's information below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
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
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="motorbike">Motorbike</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FormDescription>
                      Select the type of your vehicle.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between ">
                <FormField
                  control={form.control}
                  name="hsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1234" {...field} />
                      </FormControl>
                      <FormDescription>
                        The hsn of your vehicle.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TSN</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 12331" {...field} />
                      </FormControl>
                      <FormDescription>
                        The tsn of your vehicle.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Toyota" {...field} />
                    </FormControl>
                    <FormDescription>
                      The manufacturer of your vehicle.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Corolla" {...field} />
                    </FormControl>
                    <FormDescription>
                      The specific model of your vehicle.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      The year your vehicle was manufactured.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center mt-5">
                <Button type="submit">Submit Car Data</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
