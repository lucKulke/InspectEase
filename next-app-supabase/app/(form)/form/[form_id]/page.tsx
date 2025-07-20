import { ErrorHandler } from "@/components/ErrorHandler";
import { DBActionsBucket } from "@/lib/database/bucket";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";
import Link from "next/link";

import { DBActionsFormFillerFetch } from "@/lib/database/form-filler/formFillerFetch";
import {
  IMainCheckboxResponse,
  ISubCheckboxResponse,
  ITextInputResponse,
} from "@/lib/database/form-filler/formFillerInterfaces";
import { FormComp } from "./Form";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";

export default async function FormPage({
  params,
}: {
  params: Promise<{ form_id: UUID }>;
}) {
  const formId = (await params).form_id;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const formBuilderSupabase = await createClient("form_builder");
  const formFillerSupabase = await createClient("form_filler");
  const supabaseStorage = await createClient();

  const pubilcFetch = new DBActionsPublicFetch(supabase);
  const formFillerDbActions = new DBActionsFormFillerFetch(formFillerSupabase);
  const storageActions = new DBActionsBucket(supabaseStorage);

  const { formData, formDataError } =
    await formFillerDbActions.fetchFillableFormData(formId);

  if (!formData) return <div>No form found</div>;

  const subCheckboxes: Record<string, ISubCheckboxResponse[]> = { "": [] };

  const mainCheckboxes: Record<string, IMainCheckboxResponse[]> = { "": [] };

  const textInputFields: Record<string, ITextInputResponse[]> = { "": [] };

  formData.main_section.forEach((mainSection) => {
    mainSection.sub_section.forEach((subSection) => {
      subSection.text_input.forEach((textInput) => {
        textInputFields[subSection.id] = textInputFields[subSection.id] ?? [];
        textInputFields[subSection.id].push(textInput);
      });

      subSection.checkbox_group.forEach((group) => {
        group.main_checkbox.forEach((mainCheckbox) => {
          mainCheckboxes[group.id] = mainCheckboxes[group.id] ?? [];
          mainCheckboxes[group.id].push({
            id: mainCheckbox.id,
            order_number: mainCheckbox.order_number,
            group_id: mainCheckbox.group_id,
            label: mainCheckbox.label,
            created_at: mainCheckbox.created_at,
            checked: mainCheckbox.checked,
            prio_number: mainCheckbox.prio_number,
            annotation_id: mainCheckbox.annotation_id,
            updated_by: mainCheckbox.updated_by,
          });

          mainCheckbox.sub_checkbox.forEach((subCheckbox) => {
            subCheckboxes[mainCheckbox.id] =
              subCheckboxes[mainCheckbox.id] ?? [];
            subCheckboxes[mainCheckbox.id].push(subCheckbox);
          });
        });
      });
    });
  });

  const wsUrl = `ws${
    process.env.APP_ENVIROMENT === "development" ? "" : "s"
  }://${process.env.SESSION_AWARENESS_FEATURE_DOMAIN}/ws/form/${formId}?token=${
    process.env.SESSION_AWARENESS_FEATURE_TOKEN
  }`;

  const { teamMembers, teamMembersError } =
    await pubilcFetch.fetchTeamMembers();

  const profilePictures: Record<UUID, string | undefined> = {};

  if (teamMembers) {
    for (const member of teamMembers) {
      console.log("member: ", member);
      if (member.picture_id) {
        const { bucketResponse, bucketError } =
          await storageActions.downloadProfilePicutreViaSignedUrl(
            member.picture_id
          );
        profilePictures[member.user_id] =
          bucketResponse?.signedUrl || undefined;
      }
    }
  }

  const sessionId = uuidv4();

  return (
    <div className="">
      <Link className="ml-2" href="/form-filler">
        Back
      </Link>
      <div>
        <div className="flex justify-center">
          <h1 className="font-bold underline">{formData.identifier_string}</h1>
        </div>

        <FormComp
          sessionId={sessionId}
          userId={user.id}
          sessionAwarenessRegistrationUrl={`http${
            process.env.APP_ENVIROMENT === "development" ? "" : "s"
          }://${
            process.env.SESSION_AWARENESS_FEATURE_DOMAIN
          }/api/form-activity?token=${
            process.env.SESSION_AWARENESS_FEATURE_TOKEN
          }`}
          formData={formData}
          subCheckboxes={subCheckboxes}
          mainCheckboxes={mainCheckboxes}
          textInputFields={textInputFields}
          sessionAwarenessMonitoringWsUrl={wsUrl}
          teamMembers={teamMembers}
          profilePictures={profilePictures}
        ></FormComp>
      </div>
    </div>
  );
}
