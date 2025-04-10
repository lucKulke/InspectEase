import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IFormTextInputFieldResponse } from "@/lib/database/form-builder/formBuilderInterfaces";
import { IFillableTextInputFieldResponse } from "@/lib/database/form-filler/formFillerInterfaces";
import { UUID } from "crypto";
import React, { useEffect, useState } from "react";

interface TextInputFieldProps {
  buildInputField: IFormTextInputFieldResponse;
  fillableInputField: IFillableTextInputFieldResponse;
  handleSaveNewValue: (textInputFieldId: UUID, value: string) => Promise<void>;
}

export const TextInputField = ({
  buildInputField,
  fillableInputField,
  handleSaveNewValue,
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
    await handleSaveNewValue(fillableInputField.id, input);
    setIsSaving(false);
    setValueChanged(false);
  };

  return (
    <Card className="p-3 flex justify-between items-center">
      <p className="w-2/3">{buildInputField.label}</p>
      <Input
        className="w-1/3"
        placeholder={buildInputField.placeholder_text}
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
