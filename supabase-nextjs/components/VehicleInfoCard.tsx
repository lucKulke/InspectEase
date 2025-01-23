import React from "react";
import { Vehicle } from "@/lib/interfaces";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Car, Truck, Bike } from "lucide-react";

interface VehicleInfoCardProps {
  vehicle: Vehicle;
}

const VehicleInfoCard = ({ vehicle }: VehicleInfoCardProps) => {
  const vehicleTypes: Record<string, any> = {
    motorbike: <Bike />,
    car: <Car />,
    truck: <Truck />,
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>
            {vehicle.make} {vehicle.model}
          </CardTitle>
          <div>{vehicleTypes[vehicle.type]}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <ul className="space-y-2">
            <li>
              <span className="text-sm text-slate-700">HSN/TSN:</span>{" "}
              {vehicle.hsn} {vehicle.tsn}
            </li>
            <li>
              <span className="text-sm text-slate-700">Year:</span>{" "}
              {vehicle.year}
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default VehicleInfoCard;
