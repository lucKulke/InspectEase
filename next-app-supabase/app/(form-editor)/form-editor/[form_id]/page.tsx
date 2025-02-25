import { PDFViewer } from "@/components/PDFViewer";
import { FormMetadataCard } from "./FormMetadataCard";
import { UUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { ErrorHandler } from "@/components/ErrorHandler";
import { redirect } from "next/navigation";
import { IInspectableObjectInspectionFormPropertyResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { EditorSection } from "./EditorSection";
import { TabsContent } from "@/components/ui/tabs";
import { DBActionsBucket } from "@/lib/database/bucket";
import { FormSection } from "./Editor/FormSection";
import Link from "next/link";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { ArrowBigLeft } from "lucide-react";

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
    await storageActions.downloadDocumentViaPublicUrl(
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

  const {
    inspectableObjectInspectionFormMainSectionsWithSubSections,
    inspectableObjectInspectionFormMainSectionsWithSubSectionsError,
  } =
    await dbActions.fetchInspectableObjectInspectionFormMainSectionsWithSubSections(
      formId
    );

  if (inspectableObjectInspectionFormMainSectionsWithSubSectionsError)
    return (
      <ErrorHandler
        error={inspectableObjectInspectionFormMainSectionsWithSubSectionsError}
      ></ErrorHandler>
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
        ></FormMetadataCard>
      </div>
      <div>
        <EditorSection>
          <TabsContent value="Document" className="h-screen pt-7 pl-16 pr-16  ">
            {bucketResponse && (
              <PDFViewer pdfUrl={bucketResponse.signedUrl}></PDFViewer>
            )}
          </TabsContent>
          <TabsContent value="Editor">
            <FormSection
              formId={formId}
              mainSectionsWithSubsections={
                inspectableObjectInspectionFormMainSectionsWithSubSections
              }
            ></FormSection>
          </TabsContent>
        </EditorSection>
      </div>
      {/* <PDFViewer></PDFViewer> */}
    </div>
  );
}
