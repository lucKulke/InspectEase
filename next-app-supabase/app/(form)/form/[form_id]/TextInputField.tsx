import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IFormTextInputFieldResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { ITextInputResponse } from "@/lib/database/form-filler/formFillerInterfaces";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";

interface TextInputFieldProps {
  fillableInputField: ITextInputResponse;
  handleSaveNewTextInput: (
    subSectionId: UUID,
    textInputFieldId: UUID,
    value: string
  ) => Promise<void>;
}

export const TextInputField = ({
  fillableInputField,
  handleSaveNewTextInput,
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

  const handleSave = async () => {
    setIsSaving(true);
    await handleSaveNewTextInput(
      fillableInputField.sub_section_id,
      fillableInputField.id,
      input
    );
    setIsSaving(false);
  };

  return (
    <Card className="p-3 flex justify-between items-center">
      <p className="w-2/3">{fillableInputField.label}</p>
      <Input
        className="w-1/3"
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
          {valueChanged ? (
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
