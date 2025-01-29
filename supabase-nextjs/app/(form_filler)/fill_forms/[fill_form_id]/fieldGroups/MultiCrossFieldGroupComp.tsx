import { FieldGroup } from "@/lib/interfaces";
import React from "react";

interface MultiCrossFieldGroupCompProps {
  multiCrossFieldGroup: FieldGroup;
}
const MultiCrossFieldGroupComp = ({
  multiCrossFieldGroup,
}: MultiCrossFieldGroupCompProps) => {
  return <div>{multiCrossFieldGroup.type}</div>;
};

export default MultiCrossFieldGroupComp;
