import { ITextInputGroupResponse } from "@/lib/database/form-builder/formBuilderInterfaces";

interface TextInputGroupProps {
  groupData: ITextInputGroupResponse;
}

export const TextInputGroup = ({ groupData }: TextInputGroupProps) => {
  return (
    <div className="border-2 flex-1 min-h-24 rounded-xl p-2 hover:shadow-lg border-green-500">
      <p>Text input group</p>
      <p>{groupData.id}</p>
    </div>
  );
};
