"use client";
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
import { InspectionPlan } from "@/lib/interfaces";
import Link from "next/link";
import { Cog, FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { DBActions } from "@/lib/dbActions";

interface VehicleInspectionPlanListProps {
  inspectionPlans: InspectionPlan[];
}

const VehicleInspectionPlanList = ({
  inspectionPlans,
}: VehicleInspectionPlanListProps) => {
  const supabase = createClient();
  const dbActions = new DBActions(supabase);
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
          <TableRow key={plan.id}>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default VehicleInspectionPlanList;
