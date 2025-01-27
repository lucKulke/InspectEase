import { DBActions } from "@/lib/dbActions";
import { FieldGroup } from "@/lib/interfaces";
import { createClient } from "@/utils/supabase/server";
import React from "react";

interface SingleTextFieldGroupCompProps {
  singleTextFieldGroup: FieldGroup;
}

const SingleTextFieldGroupComp = async ({
  singleTextFieldGroup,
}: SingleTextFieldGroupCompProps) => {
  const supabase = await createClient();
  const dbActions = new DBActions(supabase);

  const { fields, fieldsError } =
    await dbActions.inspectionPlanFormFetchFieldsByFieldGroupId(
      singleTextFieldGroup.id
    );

  return (
    <div className="border-2 rounded-xl m-2 p-2">
      <p>{singleTextFieldGroup.type}</p>
      <ul>
        {fields.map((field) => (
          <li className="flex justify-between items-center">
            <p>{field.description}</p> <div className="border-2 p-2">value</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SingleTextFieldGroupComp;
