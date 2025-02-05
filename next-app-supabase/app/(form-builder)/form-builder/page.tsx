import React from "react";

import { Bike, Car, Truck, Cog, Plus } from "lucide-react";
import Link from "next/link";

import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { fetchInspectableObjectProfiles } from "./actions";
import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";
import { PageHeading } from "@/components/PageHeading";

export default async function FormBuilderPage() {
  return (
    <div className="">
      <PageHeading>Form Builder Home</PageHeading>
      <ul>
        <li>
          <Link
            className="text-blue-400"
            href={formBuilderLinks["inspectableObjectProfiles"].href}
          >
            Profiels
          </Link>
        </li>
        <li>
          <Link
            href={formBuilderLinks["inspectableObjects"].href}
            className="text-blue-400"
          >
            Objects
          </Link>
        </li>
      </ul>
    </div>
  );
}
