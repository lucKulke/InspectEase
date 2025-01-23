import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/server";
import { Bike, Car, Truck, Cog } from "lucide-react";
import { DBActions } from "@/lib/dbActions";
import Link from "next/link";
import Heading from "@/components/Heading";

const vehiclestest = [
  {
    id: "34",
    type: "INV001",
    make: "Paid",
    model: "$250.00",
    hsn: "sdf",
    tsn: "dads",
  },
];

const Studio = async () => {
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);

  let { vehicles, error } = await dbActions.fetchVehicles();

  const vehiclesInDB = vehicles ? vehicles : [];
  console.log(error);

  const vehicleTypes: Record<string, any> = {
    motorbike: <Bike />,
    car: <Car />,
    truck: <Truck />,
  };

  return (
    <>
      <Heading>All Vehicles</Heading>
      <div className="p-7">
        <Table>
          <TableCaption>A list of your vehicles.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">HSN</TableHead>
              <TableHead>TSN</TableHead>
              <TableHead>Inspection Plans</TableHead>
              <TableHead className="text-right">Config</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehiclesInDB.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicleTypes[vehicle.type]}</TableCell>
                <TableCell>{vehicle.make}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell className="text-right">{vehicle.hsn}</TableCell>
                <TableCell>{vehicle.tsn}</TableCell>
                <TableCell>{vehicle.inspection_plan_count}</TableCell>
                <TableCell className="flex justify-end">
                  <Link href={"/studio/vehicle/" + vehicle.id}>
                    <Cog />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default Studio;
