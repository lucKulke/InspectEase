import { PageHeading } from "@/components/PageHeading";
import { CreateObjectCard } from "./CreateObjectCard";

export default function CreateObject() {
  return (
    <>
      <PageHeading>Create Object</PageHeading>
      <div className="flex justify-center mt-11">
        <CreateObjectCard></CreateObjectCard>
      </div>
    </>
  );
}
