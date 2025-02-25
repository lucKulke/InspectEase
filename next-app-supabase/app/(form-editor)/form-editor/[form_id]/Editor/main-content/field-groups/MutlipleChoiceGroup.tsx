import { IMultipleChoiceGroupResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useState } from "react";

interface MultipleChoiceGroupProps {
  groupData: IMultipleChoiceGroupResponse;
}

export const MultipleChoiceGroup = ({
  groupData,
}: MultipleChoiceGroupProps) => {
  return (
    <div className="border-2 min-h-24 p-2 rounded-xl hover:shadow-lg border-green-500">
      <p>Multiple choice group</p>
      <p>{groupData.id}</p>
    </div>
  );
};
