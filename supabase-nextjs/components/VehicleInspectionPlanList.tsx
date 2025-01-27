"use client";
import React, { useEffect, useState } from "react";

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
import { InspectionPlan, ResponseMetadata } from "@/lib/interfaces";
import Link from "next/link";
import { Cog, FileText, Trash2, Ellipsis } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { DBActions } from "@/lib/dbActions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VehicleInspectionPlanListProps {
  vehicleId: string;
}

const VehicleInspectionPlanList = ({
  vehicleId,
}: VehicleInspectionPlanListProps) => {
  const supabase = createClient();
  const dbActions = new DBActions(supabase);
  const [inspectionPlans, setInspectionPlans] = useState<InspectionPlan[]>([]);

  const handleDownload = async (documentUuid: string) => {
    try {
      // Replace with your bucket name
      const { data, error } = await dbActions.getUrlForDocument(documentUuid);

      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = documentUuid; // Use the document UUID as the file name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading the document:", error);
      alert("An error occurred while downloading the document.");
    }
  };

  const fetchInspectionPlans = async () => {
    const { inspectionPlans, inspectionPlansError } =
      await dbActions.fetchInspectionPlans(vehicleId);
    setInspectionPlans(inspectionPlans);
  };

  useEffect(() => {
    fetchInspectionPlans();
  }, []);

  const handleDeleteInspectionPlan = async (inspectionPlanId: string) => {
    const { data, error } = await dbActions.deleteInspectionPlan(
      inspectionPlanId
    );

    setInspectionPlans(
      inspectionPlans.filter((plan) => {
        return plan.id !== inspectionPlanId;
      })
    );
  };
  return (
    <Table>
      <TableCaption>A list of your vehicles.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Inspection name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead className="text-right">Document</TableHead>

          <TableHead className="text-right">Config</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inspectionPlans.map((plan) => (
          <TableRow key={plan.id} className="group">
            <TableCell>{plan.inspection_name}</TableCell>
            <TableCell>{plan.description}</TableCell>
            <TableCell>{plan.frequency}</TableCell>
            <TableCell className="text-right">
              <button
                onClick={() => handleDownload(plan.document_uuid)}
                className="text-blue-500 hover:underline"
              >
                <FileText />
              </button>
            </TableCell>

            <TableCell className="flex justify-end">
              <Link href={"/studio/inspection_plan/" + plan.id}>
                <Cog />
              </Link>
            </TableCell>
            <TableCell>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                  <Ellipsis className="text-slate-500 opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-200"></Ellipsis>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={() => handleDeleteInspectionPlan(plan.id)}
                  >
                    delete <Trash2></Trash2>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default VehicleInspectionPlanList;
