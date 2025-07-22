import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IFormTextInputFieldResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { ITextInputResponse } from "@/lib/database/form-filler/formFillerInterfaces";
import { IUserProfileResponse } from "@/lib/database/public/publicInterface";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";

interface TextInputFieldProps {
  teamMembers: IUserProfileResponse[] | null;
  fillableInputField: ITextInputResponse;
  handleSaveNewTextInput: (
    subSectionId: UUID,
    textInputFieldId: UUID,
    value: string
  ) => Promise<void>;
  aiSelectedFields: UUID[];
  disabled: boolean;
}

export const TextInputField = ({
  fillableInputField,
  aiSelectedFields,
  handleSaveNewTextInput,
  disabled,
  teamMembers,
}: TextInputFieldProps) => {
  const [input, setInput] = useState<string>(fillableInputField.value ?? "");
  const [valueChanged, setValueChanged] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (input !== (fillableInputField.value ?? "")) {
      setValueChanged(true);
    } else {
      setValueChanged(false);
    }
  }, [input]);

  useEffect(() => {
    setInput(fillableInputField.value ?? "");
  }, [fillableInputField.value]);

  const handleSave = async () => {
    setIsSaving(true);
    await handleSaveNewTextInput(
      fillableInputField.sub_section_id,
      fillableInputField.id,
      input
    );
    setIsSaving(false);
  };

  const color = teamMembers?.find(
    (teamMember) => teamMember.user_id === fillableInputField.updated_by
  )?.color;

  return (
    <Card
      className={`p-3 flex justify-between items-center ${
        aiSelectedFields.includes(fillableInputField.id) && "bg-green-300"
      }`}
    >
      <p className="w-2/3">{fillableInputField.label}</p>
      <Input
        disabled={disabled}
        className={`w-1/3 ${color && "bg-" + color + "-500 shadow-xl"}`}
        placeholder={fillableInputField.placeholder_text ?? ""}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></Input>
      {isSaving ? (
        <Button className="ml-2 w-16" variant="outline">
          <Spinner></Spinner>
        </Button>
      ) : (
        <>
          {!disabled ? (
            <Button
              onClick={() => {
                handleSave();
              }}
              className="ml-2 w-16"
            >
              Save
            </Button>
          ) : (
            <Button variant="outline" className="ml-2 w-16">
              Save
            </Button>
          )}
        </>
      )}
    </Card>
  );
};
