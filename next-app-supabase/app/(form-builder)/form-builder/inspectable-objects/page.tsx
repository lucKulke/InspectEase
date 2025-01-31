import React from "react";

import { Bike, Car, Truck, Cog, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "@/components/PageHeading";
import { InspectableObjectsTable } from "./InspectableObjectsTable";
import { formBuilderLinks } from "@/lib/links/formBuilderLinks";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DBActionsFormBuilder } from "@/lib/database/formBuilder";
import { MainAddButton } from "@/components/MainAddButton";

export default async function FormBuilder() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbActions = new DBActionsFormBuilder(supabase);

  const { inspectableObjects, inspectableObjectsError } =
    await dbActions.fetchInspectableObjects(user.id);

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <PageHeading>All Objects</PageHeading>
        <MainAddButton href={formBuilderLinks["home"].href} />
      </div>

      <InspectableObjectsTable
        inspectableObjects={inspectableObjects}
        inspectableObjectsError={inspectableObjectsError}
      />
    </div>
  );
}
