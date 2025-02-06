import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { PageHeading } from "@/components/PageHeading";
import { ErrorHandler } from "@/components/ErrorHandler";
import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export default async function CreateInpsectionPlanPage({
  params,
}: {
  params: Promise<{ object_id: UUID }>;
}) {
  const objectId = (await params).object_id;
  const supabase = await createClient("form_builder");
  const dbActions = new DBActionsFormBuilderFetch(supabase);

  const { inspectableObject, inspectableObjectError } =
    await dbActions.fetchInspectableObject(objectId);

  if (inspectableObjectError)
    return <ErrorHandler error={inspectableObjectError}></ErrorHandler>;

  if (!inspectableObject) return <div>No object found. try again...</div>;

  return (
    <div>
      <PageHeading>Create inspect form</PageHeading>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Create inpection plan</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
    </div>
  );
}
