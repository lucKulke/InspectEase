import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IconType, profileIcons } from "@/lib/availableIcons";
import { IFillableFormResponse } from "@/lib/database/form-filler/formFillerInterfaces";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

import React from "react";

interface FormCardProps {
  form: IFillableFormResponse;
}

export const FormCard = ({ form }: FormCardProps) => {
  const router = useRouter();
  return (
    <Card key={form.id} className="h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <CardHeader>
          <CardTitle>ID: {form.identifier_string}</CardTitle>
          <CardDescription>
            {" "}
            build id: {form.build_id || "No build id available"}
          </CardDescription>
        </CardHeader>
        <div className="m-7">
          {profileIcons[form.object_profile_icon as IconType]}
        </div>
      </div>

      <CardContent>
        <ul className="mb-3 space-y-2">
          {Object.entries(form.object_props).map(([key, value]) => {
            return (
              <li key={key + form.id} className="flex space-x-2 items-center">
                <p className="text-slate-600 text-sm">{key}:</p> <p>{value}</p>
              </li>
            );
          })}
        </ul>

        <Progress></Progress>
        <div className="text-sm text-gray-500">
          Last updated:{" "}
          {format(new Date(form.updated_at || form.created_at), "MMM d, yyyy")}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() => {
            router.push("/form/" + form.id);
          }}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};
