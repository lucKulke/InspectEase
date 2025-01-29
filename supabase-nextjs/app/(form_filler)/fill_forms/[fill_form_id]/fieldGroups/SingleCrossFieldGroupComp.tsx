import { FieldGroup } from "@/lib/interfaces";
import React from "react";

interface SingleCrossFieldGroupCompProps {
  singleCrossFieldGroup: FieldGroup;
}

const SingleCrossFieldGroupComp = ({
  singleCrossFieldGroup,
}: SingleCrossFieldGroupCompProps) => {
  return <div>{singleCrossFieldGroup.type}</div>;
};

export default SingleCrossFieldGroupComp;
