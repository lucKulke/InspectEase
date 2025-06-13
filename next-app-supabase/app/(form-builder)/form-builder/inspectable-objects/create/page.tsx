import { PageHeading } from "@/components/PageHeading";
import { CreateObjectCard } from "./CreateObjectCard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UUID } from "crypto";
import { fetchUsersAvailableObjectProfiles } from "./actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function CreateObjectPage() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { inspectableObjectProfiles, inspectableObjectProfilesError } =
    await fetchUsersAvailableObjectProfiles(user.id as UUID, supabase);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbLink href="/form-builder/inspectable-objects">
                Objects
              </BreadcrumbLink>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Create</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="m-5 ml-8 mr-8">
        <div className="flex justify-center">
          <CreateObjectCard
            availableProfiles={inspectableObjectProfiles}
            availableProfilesError={inspectableObjectProfilesError}
          ></CreateObjectCard>
        </div>
      </div>
    </>
  );
}
