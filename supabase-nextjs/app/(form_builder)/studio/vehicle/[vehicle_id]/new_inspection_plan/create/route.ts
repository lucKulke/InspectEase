import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { randomUUID } from "crypto";
import { DBActions } from "@/lib/dbActions";
import { Metadata } from "@/lib/interfaces";

// Disable Next.js body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);
  try {
    // Parse the form data using formidable
    const formData = await request.formData();

    console.log(formData);
    const file = formData.get("file") as File;
    const metadataString = formData.get("metadata") as string | null;

    // Check if a file was uploaded
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!metadataString) {
      return NextResponse.json(
        { error: "No metadata uploaded" },
        { status: 400 }
      );
    }

    let metadata: Metadata;
    try {
      metadata = JSON.parse(metadataString);
      console.log("metadata name", metadata.name);

      const { inspectionPlanResult, inspectionPlanResultError } =
        await dbActions.createInspectionPlan(metadata);
      console.log("inspectionPlanResult: ", inspectionPlanResult);

      if (inspectionPlanResultError) {
        return NextResponse.json(
          { error: "Failed to create inspection plan in db" },
          { status: 500 }
        );
      }

      const { annotationResult, annotationResultError } =
        await dbActions.createDocumentAnnotations(
          metadata.annotations,
          inspectionPlanResult[0].id
        );
      console.log("annotationResult: ", annotationResult);

      if (annotationResultError) {
        return NextResponse.json(
          { error: "Failed to create annotations in db" },
          { status: 500 }
        );
      }
      const newFileName = `${inspectionPlanResult[0].document_uuid}.pdf`;

      const { bucketResult, bucketResultError } =
        await dbActions.uploadDocumentToBucket(file, newFileName);
      console.log("bucketResult: ", bucketResult);

      if (bucketResultError) {
        return NextResponse.json(
          { error: "Failed to upload file to storage" },
          { status: 500 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Something went wrong during db communication" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "All data stored successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Unknown Error" }, { status: 500 });
  }
}
