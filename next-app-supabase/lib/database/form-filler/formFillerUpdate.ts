import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";

import { SupabaseError } from "@/lib/globalInterfaces";
import {
  IMainCheckboxResponse,
  ISubCheckboxResponse,
  ITextInputResponse,
} from "./formFillerInterfaces";

export class DBActionsFormFillerUpdate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }
  async updateFormUpdatedAt(formId: UUID): Promise<{
    updatedForm: IMainCheckboxResponse | null;
    updatedFormError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", formId)
      .select()
      .single();

    console.log("update updated_at from form in db:", data);
    if (error) {
      console.error("update updated_at from form in db error: ", error);
    }

    return {
      updatedForm: data,
      updatedFormError: error as SupabaseError | null,
    };
  }
  async updateMainCheckboxValue(
    checkboxId: UUID,
    value: boolean
  ): Promise<{
    updatedMainCheckbox: IMainCheckboxResponse | null;
    updatedMainCheckboxError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("main_checkbox")
      .update({ checked: value })
      .eq("id", checkboxId)
      .select()
      .single();

    console.log("update main checkbox in db:", data);
    if (error) {
      console.error("update main checkbox in db error: ", error);
    }

    return {
      updatedMainCheckbox: data,
      updatedMainCheckboxError: error as SupabaseError | null,
    };
  }

  async updateSubCheckboxValue(
    checkboxId: UUID,
    value: boolean
  ): Promise<{
    updatedSubCheckbox: ISubCheckboxResponse | null;
    updatedSubCheckboxError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("sub_checkbox")
      .update({ checked: value })
      .eq("id", checkboxId)
      .select()
      .single();

    console.log("update sub checkbox in db:", data);
    if (error) {
      console.error("update sub checkbox in db error: ", error);
    }

    return {
      updatedSubCheckbox: data,
      updatedSubCheckboxError: error as SupabaseError | null,
    };
  }

  async updateTextInputField(
    textInputFieldId: UUID,
    value: string
  ): Promise<{
    updatedTextInputField: ITextInputResponse | null;
    updatedTextInputFieldError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("text_input")
      .update({ value: value })
      .eq("id", textInputFieldId)
      .select()
      .single();

    console.log("update text input field in db:", data);
    if (error) {
      console.error("update text input field in db error: ", error);
    }

    return {
      updatedTextInputField: data,
      updatedTextInputFieldError: error as SupabaseError | null,
    };
  }
}
