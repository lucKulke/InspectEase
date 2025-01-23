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
import { supabase } from "@/lib/supabase";

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

interface Vehicle {
  id: string;
  created_at: string;
  type: string;
  make: string;
  model: string;
  hsn: string;
  tsn: string;
}

const Studio = async () => {
  let { data: vehicles, error } = await supabase.from("vehicles").select("*");

  const vehiclesInDB: Vehicle[] = vehicles ? vehicles : [];
  console.log(error);

  return (
    <div className="p-7">
      <Table>
        <TableCaption>A list of your vehicles.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead>Make</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>HSN</TableHead>
            <TableHead>TSN</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehiclesInDB.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell className="font-medium">{vehicle.type}</TableCell>
              <TableCell>{vehicle.make}</TableCell>
              <TableCell>{vehicle.model}</TableCell>
              <TableCell>{vehicle.hsn}</TableCell>
              <TableCell>{vehicle.tsn}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Studio;
