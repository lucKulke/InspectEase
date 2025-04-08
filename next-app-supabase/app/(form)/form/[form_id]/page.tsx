import { ErrorHandler } from "@/components/ErrorHandler";
import { DBActionsBucket } from "@/lib/database/bucket";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import Link from "next/link";
import { MainComp } from "./MainComp";
import { DBActionsFormFillerFetch } from "@/lib/database/form-filler/formFillerFetch";

export default async function FormPage({
  params,
}: {
  params: Promise<{ form_id: UUID }>;
}) {
  const formId = (await params).form_id;

  const formBuilderSupabase = await createClient("form_builder");
  const formFillerSupabase = await createClient("form_filler");
  const supabaseStorage = await createClient();
  const formBuilderDbActions = new DBActionsFormBuilderFetch(
    formBuilderSupabase
  );
  const formFillerDbActions = new DBActionsFormFillerFetch(formFillerSupabase);
  const storageActions = new DBActionsBucket(supabaseStorage);

  const { form, formError } = await formFillerDbActions.fetchFillableForm(
    formId
  );

  if (!form) return <div>No form found</div>;

  const {
    inspectableObjectInspectionFormMainSectionsWithSubSectionData,
    inspectableObjectInspectionFormMainSectionsWithSubSectionDataError,
  } =
    await formBuilderDbActions.fetchInspectableObjectInspectionFormMainSectionsWithSubSections(
      form.build_id
    );

  if (inspectableObjectInspectionFormMainSectionsWithSubSectionDataError)
    return (
      <ErrorHandler
        error={
          inspectableObjectInspectionFormMainSectionsWithSubSectionDataError
        }
      ></ErrorHandler>
    );

  return (
    <div className="">
      <Link className="ml-2" href="/form-filler">
        Back
      </Link>
      <div>
        <MainComp
          formBuildData={
            inspectableObjectInspectionFormMainSectionsWithSubSectionData
          }
        ></MainComp>
      </div>
    </div>
  );
}
