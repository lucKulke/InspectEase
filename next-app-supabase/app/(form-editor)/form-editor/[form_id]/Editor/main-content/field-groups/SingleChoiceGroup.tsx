import { ISingleChoiceGroupResponse } from "@/lib/database/form-builder/formBuilderInterfaces";

interface SingleChoiceGroupProps {
  groupData: ISingleChoiceGroupResponse;
}

export const SingleChoiceGroup = ({ groupData }: SingleChoiceGroupProps) => {
  return (
    <div className="border-2 flex-1 min-h-24 rounded-xl p-2 hover:shadow-lg border-green-500">
      <p>Single choice group</p>
      {groupData.id}
    </div>
  );
};
