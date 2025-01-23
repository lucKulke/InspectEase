import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponseMetadata } from "@/lib/interfaces";
import Link from "next/link";

interface InspectionPlanMetadataInfoCardProps {
  infos: ResponseMetadata;
}

const InspectionPlanMetadataInfoCard = ({
  infos,
}: InspectionPlanMetadataInfoCardProps) => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{infos.inspection_name}</CardTitle>
        <CardDescription>{infos.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <div>type: {infos.maintenance_interval_type}</div>
          <div>frequency: {infos.frequency}</div>
          <div>
            <h2>vehicle id:</h2>
            <Link href={"/studio/vehicle/" + infos.vehicle_id}>
              {infos.vehicle_id}
            </Link>
          </div>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default InspectionPlanMetadataInfoCard;
