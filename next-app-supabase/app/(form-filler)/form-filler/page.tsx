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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function FormFillerPage() {
  const supabase = await createClient("form_filler");

  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    redirect("/auth/login");
  }

  const dbActions = new DBActionsFormFillerFetch(supabase);
  const wsUrl = `wss://${process.env.SESSION_AWARENESS_FEATURE_DOMAIN}/ws/dashboard`;

  const { forms, formsError } = await dbActions.fetchAllFillableForms(
    user.user?.id as UUID
  );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Forms</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="m-5 ml-8 mr-8">
        <FormFilter wsUrl={wsUrl} forms={forms}></FormFilter>
      </div>
    </>
  );
}
