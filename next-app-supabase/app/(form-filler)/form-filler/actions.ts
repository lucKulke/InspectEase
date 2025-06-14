"use server";

import { DBActionsBucket } from "@/lib/database/bucket";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { DBActionsFormFillerDelete } from "@/lib/database/form-filler/formFillerDelete";
import { DBActionsFormFillerFetch } from "@/lib/database/form-filler/formFillerFetch";
import { IFillableFormPlusFillableFields } from "@/lib/database/form-filler/formFillerInterfaces";
import { DBActionsFormFillerUpdate } from "@/lib/database/form-filler/formFillerUpdate";
import { StorageError, SupabaseError } from "@/lib/globalInterfaces";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function fetchFormProgress(formId: UUID) {}

export async function deleteForms(formIds: UUID[]) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerDelete(supabase);
  return await dbActions.deleteFillableForms(formIds);
}

export async function updateFormProgressState(formId: UUID, value: boolean) {
  const supabase = await createClient("form_filler");

  const dbActions = new DBActionsFormFillerUpdate(supabase);
  return await dbActions.updateFormToComplete(formId, value);
}

interface Position {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Location {
  page: number;
  content: string;
  position: Position;
}

interface LocationsWrapper {
  locations: Location[];
}

async function usePDFAPI(signedUrl: string, locations: LocationsWrapper) {
  console.log("pdf tool url", process.env.PDF_TOOL_URL);

  // Step 1: Fetch the PDF from the signed URL
  const response = await fetch(signedUrl);
  if (!response.ok) {
    console.log(
      `Failed to fetch PDF from signed URL, status: ${response.status}`
    );
    throw new Error(
      `Failed to fetch PDF from signed URL, status: ${response.status}`
    );
  }

  const blob = await response.blob();

  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const cleanedBlob = new Blob([buffer], { type: "application/pdf" });

  const formCleanerData = new FormData();
  formCleanerData.append("pdf", cleanedBlob, "uploaded.pdf");

  // Step 3: clean up pdf
  const uploadResponseCleaner = await fetch(
    `${process.env.PDF_TOOL_URL}/remove-annotations`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formCleanerData,
    }
  );

  if (!uploadResponseCleaner.ok) {
    console.log(`Error uploading PDF! status: ${uploadResponseCleaner.status}`);
    throw new Error(
      `Error uploading PDF! status: ${uploadResponseCleaner.status}`
    );
  }

  const resultBlobCleaner = await uploadResponseCleaner.blob();

  const arrayBufferCleaner = await resultBlobCleaner.arrayBuffer();
  const bufferCleaner = Buffer.from(arrayBufferCleaner);
  const cleanedFile = new Blob([bufferCleaner], { type: "application/pdf" });

  const formFillerData = new FormData();
  formFillerData.append("file", cleanedFile, "uploaded.pdf");
  formFillerData.append("locations", JSON.stringify(locations));

  const uploadResponseFiller = await fetch(
    `${process.env.PDF_TOOL_URL}/fill-pdf`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formFillerData,
    }
  );

  if (!uploadResponseFiller.ok) {
    console.log(`Error uploading PDF! status: ${uploadResponseFiller.status}`);
    throw new Error(
      `Error uploading PDF! status: ${uploadResponseFiller.status}`
    );
  }

  const resultBlob = await uploadResponseFiller.blob();

  return resultBlob;
}

export async function fillPDF(form: IFillableFormPlusFillableFields): Promise<{
  resultBlob: Blob | null;
  error: string | null;
}> {
  const formBuilderDbActions = new DBActionsFormBuilderFetch(
    await createClient("form_builder")
  );

  const formFillerDbActions = new DBActionsFormFillerFetch(
    await createClient("form_filler")
  );

  const storageActions = new DBActionsBucket(await createClient());

  const { bucketResponse, bucketError } =
    await storageActions.downloadDocumentViaSignedUrl(form.document_id);

  if (bucketError) {
    return { resultBlob: null, error: "Download document from bucket failed" };
  }
  const {
    inspectableObjectInspectionFormAnnotations,
    inspectableObjectInspectionFormAnnotationsError,
  } =
    await formBuilderDbActions.fetchInspectableObjectInspectionFormAnnotations(
      form.build_id
    );

  if (!inspectableObjectInspectionFormAnnotations)
    return { resultBlob: null, error: "Fetching annotation data failed" };

  const { formData, formDataError } =
    await formFillerDbActions.fetchFillableFormData(form.id);

  if (!formData)
    return { resultBlob: null, error: "Fetching form data failed" };

  const wrapper: LocationsWrapper = { locations: [] };

  formData.main_section.forEach((mainSection) => {
    mainSection.sub_section.forEach((subSection) => {
      subSection.checkbox_group.forEach((group) => {
        group.main_checkbox.forEach((checkbox) => {
          if (checkbox.checked) {
            const annoData = inspectableObjectInspectionFormAnnotations.filter(
              (annotationData) => annotationData.id === checkbox.annotation_id
            )[0];

            wrapper.locations.push({
              page: annoData.page,
              position: {
                x1: annoData.x1 + 5,
                y1: annoData.y1 + 5,
                x2: annoData.x2,
                y2: annoData.y2,
              },
              content: "X",
            });
          }
        });
      });
      subSection.text_input.forEach((textInput) => {
        const annoData = inspectableObjectInspectionFormAnnotations.filter(
          (annotationData) => annotationData.id === textInput.annotation_id
        )[0];

        wrapper.locations.push({
          page: annoData.page,
          position: {
            x1: annoData.x1 + 5,
            y1: annoData.y1 + 5,
            x2: annoData.x2,
            y2: annoData.y2,
          },
          content: textInput.value ?? "",
        });
      });
    });
  });

  if (bucketResponse) {
    let resultBlob = null;
    try {
      resultBlob = await usePDFAPI(bucketResponse.signedUrl, wrapper);
    } catch {
      return { resultBlob: null, error: "Error during api usage" };
    }
    return { resultBlob: resultBlob, error: null };
  }
  return { resultBlob: null, error: null };
}
