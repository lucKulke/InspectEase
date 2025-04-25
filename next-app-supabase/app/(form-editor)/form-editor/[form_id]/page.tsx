import { PDFViewer } from "@/components/PDFViewer";
import { FormMetadataCard } from "./FormMetadataCard";
import { UUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { ErrorHandler } from "@/components/ErrorHandler";
import { redirect } from "next/navigation";
import {
  IInspectableObjectInspectionFormPropertyResponse,
  IInspectableObjectInspectionFormSubSectionWithData,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import { Editor } from "./Editor/Editor";
import { TabsContent } from "@/components/ui/tabs";
import { DBActionsBucket } from "@/lib/database/bucket";
import { FormSection } from "./Editor/FormSection";
import Link from "next/link";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { ArrowBigLeft } from "lucide-react";
import { fetchStringExtractionTrainings } from "./Editor/main-content/actions";

export default async function FormEditorPage({
  params,
}: {
  params: Promise<{ form_id: UUID }>;
}) {
  const formId = (await params).form_id;

  const supabase = await createClient("form_builder");
  const supabaseStorage = await createClient();
  const dbActions = new DBActionsFormBuilderFetch(supabase);
  const storageActions = new DBActionsBucket(supabaseStorage);

  const {
    inspectableObjectInspectionFormWithProps,
    inspectableObjectInspectionFormWithPropsError,
  } = await dbActions.fetchInspectableObjectInspectionFormWithProps(formId);

  if (inspectableObjectInspectionFormWithPropsError) {
    return (
      <ErrorHandler error={inspectableObjectInspectionFormWithPropsError} />
    );
  }
  if (!inspectableObjectInspectionFormWithProps) {
    redirect("/error");
  }

  const {
    inspectableObjectProfileFormTypeWithProps,
    inspectableObjectProfileFormTypeWithPropsError,
  } = await dbActions.fetchInspectableObjectProfileFormTypeWithProps(
    inspectableObjectInspectionFormWithProps.form_type_id
  );

  if (inspectableObjectProfileFormTypeWithPropsError) {
    return (
      <ErrorHandler error={inspectableObjectProfileFormTypeWithPropsError} />
    );
  }
  if (!inspectableObjectProfileFormTypeWithProps) {
    redirect("/error");
  }

  const { bucketResponse, bucketError } =
    await storageActions.downloadDocumentViaSignedUrl(
      inspectableObjectInspectionFormWithProps.document_id
    );

  const formMetadata: Record<
    UUID,
    IInspectableObjectInspectionFormPropertyResponse
  > = {};
  inspectableObjectInspectionFormWithProps.inspectable_object_inspection_form_property.forEach(
    (inspectionFormProp) => {
      formMetadata[inspectionFormProp.form_type_prop_id] = inspectionFormProp;
    }
  );

  const { trainingList, error } = await fetchStringExtractionTrainings(formId);
  if (error) return <ErrorHandler error={error}></ErrorHandler>;

  const {
    inspectableObjectInspectionFormMainSectionsWithSubSectionData,
    inspectableObjectInspectionFormMainSectionsWithSubSectionDataError,
  } =
    await dbActions.fetchInspectableObjectInspectionFormMainSectionsWithSubSections(
      formId
    );

  if (inspectableObjectInspectionFormMainSectionsWithSubSectionDataError)
    return (
      <ErrorHandler
        error={
          inspectableObjectInspectionFormMainSectionsWithSubSectionDataError
        }
      ></ErrorHandler>
    );

  const subSectionData: Record<
    UUID,
    IInspectableObjectInspectionFormSubSectionWithData
  > = {};
  inspectableObjectInspectionFormMainSectionsWithSubSectionData.forEach(
    (mainSection) => {
      mainSection.inspectable_object_inspection_form_sub_section.forEach(
        (subSection) => {
          subSectionData[subSection.id] = subSection;
        }
      );
    }
  );

  return (
    <div className="mt-10 p-4">
      <div>
        <Link
          className="flex items-center mb-2"
          href={
            formBuilderLinks["inspectableObjects"].href +
            "/" +
            inspectableObjectInspectionFormWithProps.object_id
          }
        >
          <ArrowBigLeft /> Back
        </Link>
      </div>
      <div className="w-1/4">
        <FormMetadataCard
          formId={formId}
          formMetadata={formMetadata}
          profileFormTypeWithProps={inspectableObjectProfileFormTypeWithProps}
          objId={inspectableObjectInspectionFormWithProps.object_id}
        ></FormMetadataCard>
      </div>
      <div>
        <Editor
          mainSubSection={
            inspectableObjectInspectionFormMainSectionsWithSubSectionData
          }
          bucketResponse={bucketResponse}
          formId={formId}
          subSectionData={subSectionData}
          trainingList={trainingList}
        />
      </div>
      {/* <PDFViewer></PDFViewer> */}
    </div>
  );
}
