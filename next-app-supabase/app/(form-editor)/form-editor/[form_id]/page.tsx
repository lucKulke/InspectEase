import { PDFViewer } from "@/components/PDFViewer";
import { FormMetadataCard } from "./FormMetadataCard";
import { UUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { ErrorHandler } from "@/components/ErrorHandler";
import { redirect } from "next/navigation";
import { IInspectableObjectInspectionFormPropertyResponse } from "@/lib/database/form-builder/formBuilderInterfaces";

export default async function FormEditorPage({
  params,
}: {
  params: Promise<{ form_id: UUID }>;
}) {
  const formId = (await params).form_id;

  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

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

  const formMetadata: Record<
    UUID,
    IInspectableObjectInspectionFormPropertyResponse
  > = {};
  inspectableObjectInspectionFormWithProps.inspectable_object_inspection_form_property.forEach(
    (inspectionFormProp) => {
      formMetadata[inspectionFormProp.form_type_prop_id] = inspectionFormProp;
    }
  );

  return (
    <div className="mt-10">
      <div className="w-1/4">
        <FormMetadataCard
          formId={formId}
          formMetadata={formMetadata}
          profileFormTypeWithProps={inspectableObjectProfileFormTypeWithProps}
        ></FormMetadataCard>
      </div>
      <div>test</div>
      {/* <PDFViewer></PDFViewer> */}
    </div>
  );
}
