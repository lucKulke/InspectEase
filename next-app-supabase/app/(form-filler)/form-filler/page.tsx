import React from "react";

import { Bike, Car, Truck, Cog, Plus } from "lucide-react";
import Link from "next/link";

import { formBuilderLinks } from "@/lib/links/formBuilderLinks";

import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";
import { PageHeading } from "@/components/PageHeading";
import { formFillerLinks } from "@/lib/links/formFillerLinks";
import { FormFilter } from "./formFilter";

export default async function FormFillerPage() {
  return (
    <div className="">
      <PageHeading>Form Filler Home</PageHeading>
      <Link href={formFillerLinks.selectForm.href} className="text-blue-600">
        Select form
      </Link>
      <FormFilter></FormFilter>
    </div>
  );
}
