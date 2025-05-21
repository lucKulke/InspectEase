import React from "react";

import { Bike, Car, Truck, Cog, Plus } from "lucide-react";
import Link from "next/link";

import { formBuilderLinks } from "@/lib/links/formBuilderLinks";

import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";
import { PageHeading } from "@/components/PageHeading";
import { formFillerLinks } from "@/lib/links/formFillerLinks";
import { FormFilter } from "./formFilter";
import { DBActionsFormFillerFetch } from "@/lib/database/form-filler/formFillerFetch";
import { UUID } from "crypto";
import { MainAddButton } from "@/components/MainAddButton";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";

export default async function FormFillerPage() {
  const supabase = await createClient("form_filler");
  const supabasePublic = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    redirect("/auth/login");
  }

  const dbActions = new DBActionsFormFillerFetch(supabase);
  const wsUrl = `wss://${process.env.SESSION_AWARENESS_FEATURE_DOMAIN}/ws/dashboard`;

  const publicFetchActions = new DBActionsPublicFetch(supabasePublic);

  const { userProfile, userProfileError } =
    await publicFetchActions.fetchUserProfile(user.user.id as UUID);

  const { forms, formsError } = await dbActions.fetchAllFillableForms(
    user.user?.id as UUID
  );
  let allForms = forms;

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <PageHeading>Form Filler</PageHeading>
        <div className="mr-2 flex">
          <MainAddButton href={formFillerLinks["selectForm"].href} />
        </div>
      </div>

      <FormFilter wsUrl={wsUrl} forms={allForms}></FormFilter>
    </div>
  );
}
