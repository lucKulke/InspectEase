import React from "react";

import Link from "next/link";

import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
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
            Profiles
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
