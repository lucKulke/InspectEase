import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FillableFormsMetadata } from "@/lib/interfaces";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import Link from "next/link";

import { Progress } from "@/components/ui/progress";

interface InspectionPlanCardProps {
  formMetadata: FillableFormsMetadata;
}

const InspectionPlanCard = ({ formMetadata }: InspectionPlanCardProps) => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>Order number: {formMetadata.order_number}</CardTitle>
          <CardDescription></CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Link href={"/fill_forms/" + formMetadata.id}>Enter</Link>
        </div>
      </CardContent>
      <CardFooter>
        <Progress value={formMetadata.progress} className="" />
      </CardFooter>
    </Card>
  );
};

export default InspectionPlanCard;
