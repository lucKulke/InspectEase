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
      <PageHeading>Form Filler Home</PageHeading>
      <Link href={formFillerLinks.selectForm.href} className="text-blue-600">
        Select form
      </Link>
      <FormFilter forms={forms}></FormFilter>
    </div>
  );
}
