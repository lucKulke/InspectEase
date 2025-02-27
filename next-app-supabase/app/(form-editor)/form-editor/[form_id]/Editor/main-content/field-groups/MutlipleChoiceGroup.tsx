import { IMultipleChoiceGroupResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Trash2, ArrowBigRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MultipleChoiceGroupProps {
  groupData: IMultipleChoiceGroupResponse;
}

export const MultipleChoiceGroup = ({
  groupData,
}: MultipleChoiceGroupProps) => {
  return (
    <div className="border-2 min-h-24 p-2 rounded-xl hover:shadow-lg border-green-500">
      <p>Multiple choice group</p>

      <div>
        <div className="flex space-x-3 items-center">
          <Card className="w-2/3">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle>Tasks</CardTitle>

                  <CardDescription>
                    Tasks that need to be completed
                  </CardDescription>
                </div>
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
            </CardHeader>
            <CardContent>

              <ul>
                {groupData.multiple_choice_field.}
              </ul>
            </CardContent>
          </Card>
          <ArrowBigRight size={32}></ArrowBigRight>
          <Card className="w-1/3">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle>Checkboxes</CardTitle>

                  <CardDescription>
                    Checkboxes marked on document
                  </CardDescription>
                </div>
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
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
