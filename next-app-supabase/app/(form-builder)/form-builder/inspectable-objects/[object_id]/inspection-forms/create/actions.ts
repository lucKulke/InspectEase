"use server";

import { DBActionsBucket } from "@/lib/database/bucket";
import { DBActionsFormBuilderCreate } from "@/lib/database/form-builder/formBuilderCreate";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import {
  IInspectableObjectInspectionFormAnnotationInsert,
  IInspectableObjectInspectionFormInsert,
  IInspectableObjectInspectionFormPropertyInsert,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { AnnotationData, SupabaseError } from "@/lib/globalInterfaces";
import { extractAnnotations } from "@/utils/pdfTools";
import { createClient } from "@/utils/supabase/server";
import { error } from "console";
import { UUID } from "crypto";
import { FileX2 } from "lucide-react";

export async function fetchProfileFormTypeProps(formTypeId: UUID) {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  return await dbActions.fetchInspectableObjectProfileFormTypeProps(formTypeId);
}

async function uploadDocument(fileName: UUID, file: File) {
  const supabase = await createClient();
  const dbStorageActions = new DBActionsBucket(supabase);

  return await dbStorageActions.uploadDocument(fileName, file);
}

export async function createInspectionForm(
  formTypeId: UUID,
  objectId: UUID,
  metadata: Record<UUID, string>,
  file: File,
  annotations: AnnotationData[]
): Promise<{ inspectionForm: any; inspectionFormError: SupabaseError | null }> {
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderCreate(supabase);

  // step 1: create inpsection form in db
  const newInspectionFormData: IInspectableObjectInspectionFormInsert = {
    form_type_id: formTypeId,
    object_id: objectId,
  };

  const {
    inspectableObjectInspectionForm,
    inspectableObjectInspectionFormError,
  } = await dbActions.createInspectableObjectInspectionForm(
    newInspectionFormData
  );

  if (
    inspectableObjectInspectionFormError ||
    !inspectableObjectInspectionForm
  ) {
    return {
      inspectionForm: null,
      inspectionFormError: inspectableObjectInspectionFormError,
    };
  }
  // step 1: end

  // step 2: upload document to bucket
  const fileName = inspectableObjectInspectionForm.document_id;

  const { bucketResponse, bucketError } = await uploadDocument(fileName, file);

  if (bucketError) {
    const error: SupabaseError = {
      code: "unknown",
      details: "unknown",
      hint: bucketError.name,
      message: bucketError.message,
    };

    return { inspectionForm: null, inspectionFormError: error };
  }
  // step 2: end

  // step 3: create inpection form metadata (properties)

  const newFormProperties: IInspectableObjectInspectionFormPropertyInsert[] =
    [];

  Object.entries(metadata).forEach(([typePropId, value]) => {
    newFormProperties.push({
      form_type_prop_id: typePropId as UUID,
      inspection_form_id: inspectableObjectInspectionForm.id,
      value: value,
    });
  });

  const {
    inspectableObjectInspectionFormProperties,
    inspectableObjectInspectionFormPropertiesError,
  } = await dbActions.createInspectableObjectInspectionFormProperties(
    newFormProperties
  );

  if (inspectableObjectInspectionFormPropertiesError) {
    return {
      inspectionForm: null,
      inspectionFormError: inspectableObjectInspectionFormPropertiesError,
    };
  }

  // step 3: end

  // step 4: create form annotations

  const newAnnotations: IInspectableObjectInspectionFormAnnotationInsert[] = [];

  annotations.forEach((annotation) => {
    newAnnotations.push({
      inspection_form_id: inspectableObjectInspectionForm.id,
      page: annotation.pageNumber,
      type: annotation.type,
      content: annotation.contents,
      x1: annotation.rect["x1"],
      x2: annotation.rect["x2"],
      y1: annotation.rect["y1"],
      y2: annotation.rect["y2"],
    });
    annotation;
  });

  const {
    inspectableObjectInspectionFormAnnotations,
    inspectableObjectInspectionFormAnnotationsError,
  } = await dbActions.createInspectableObjectInspectionFormAnnotations(
    newAnnotations
  );

  if (inspectableObjectInspectionFormAnnotationsError) {
    return {
      inspectionForm: null,
      inspectionFormError: inspectableObjectInspectionFormAnnotationsError,
    };
  }

  return {
    inspectionForm: inspectableObjectInspectionForm,
    inspectionFormError: null,
  };
}

export async function createAnnotations() {}
