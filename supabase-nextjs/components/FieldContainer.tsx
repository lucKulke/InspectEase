import React from "react";

interface FieldContainerProps {
  fieldDescription: string;
  fieldId: string;
}

const FieldContainer = ({ fieldDescription, fieldId }: FieldContainerProps) => {
  return (
    <div className="border-2 rounded-2xl space-x-2 p-2 flex bg-slate-100">
      <h4 className="font-bold">{fieldId}</h4>
      <p>{fieldDescription}</p>
    </div>
  );
};

export default FieldContainer;
