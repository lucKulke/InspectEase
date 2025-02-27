import { ISingleChoiceGroupResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Trash2 } from "lucide-react";
interface SingleChoiceGroupProps {
  groupData: ISingleChoiceGroupResponse;
}

export const SingleChoiceGroup = ({ groupData }: SingleChoiceGroupProps) => {
  return (
    <div className="border-2 flex-1 min-h-24 rounded-xl p-2 hover:shadow-lg border-green-500">
      <div className="flex justify-between">
        <p>Single choice group</p>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger>
            <Ellipsis className="text-slate-500 "></Ellipsis>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem>view</DropdownMenuItem>
            <DropdownMenuItem>update</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              delete <Trash2></Trash2>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {groupData.id}
    </div>
  );
};
