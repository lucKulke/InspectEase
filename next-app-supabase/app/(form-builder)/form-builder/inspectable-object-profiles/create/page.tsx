import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/PageHeading";
import { CreateProfileCard } from "./CreateProfileCard";

export default async function InspectableObjectCreatePage() {
  const supabase = await createClient("form_builder");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div>
      <PageHeading>Create Profile</PageHeading>
      <div className="flex justify-center">
        <CreateProfileCard />
      </div>
    </div>
  );
}
