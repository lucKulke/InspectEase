import React from "react";

import { Bike, Car, Truck, Cog, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "@/components/Heading";
import { InspectableObjectsTable } from "./InspectableObjectsTable";

export default function FormBuilder() {
  return (
    <>
      <div className="flex items-center">
        <PageHeading>All Objects</PageHeading>
        <Link
          className="border-2 p-2 rounded-xl hover:bg-slate-600 hover:border-slate-600 active:bg-black"
          href={"/studio/new-vehicle"}
        >
          <Plus />
        </Link>
        <InspectableObjectsTable></InspectableObjectsTable>
      </div>
      <div className="p-7"></div>
    </>
  );
}
