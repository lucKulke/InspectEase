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

export default async function FormFillerPage() {
  const supabase = await createClient("form_filler");

  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    redirect("/auth/login");
  }

  const dbActions = new DBActionsFormFillerFetch(supabase);

  const { forms, formsError } = await dbActions.fetchAllFillableForms(
    user.user?.id as UUID
  );

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <PageHeading>Form Filler</PageHeading>
        <div className="mr-2 flex">
          <MainAddButton href={formFillerLinks["selectForm"].href} />
        </div>
      </div>

      <FormFilter forms={forms}></FormFilter>
    </div>
  );
}
