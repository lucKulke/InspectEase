import { SupabaseClient } from "@supabase/supabase-js";
import { UUID } from "crypto";
import {
  IFillableMainCheckboxResponse,
  IFillableTextInputFieldResponse,
} from "./formFillerInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";

export class DBActionsFormFillerUpdate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async updateMainCheckboxValue(
    checkboxId: UUID,
    value: boolean
  ): Promise<{
    updatedMainCheckbox: IFillableMainCheckboxResponse | null;
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

  async updateCheckboxValue(
    checkboxId: UUID,
    value: boolean
  ): Promise<{
    updatedCheckbox: IFillableMainCheckboxResponse | null;
    updatedCheckboxError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("checkbox")
      .update({ checked: value })
      .eq("id", checkboxId)
      .select()
      .single();

    console.log("update checkbox in db:", data);
    if (error) {
      console.error("update checkbox in db error: ", error);
    }

    return {
      updatedCheckbox: data,
      updatedCheckboxError: error as SupabaseError | null,
    };
  }

  async updateTextInputField(
    textInputFieldId: UUID,
    value: string
  ): Promise<{
    updatedTextInputField: IFillableTextInputFieldResponse | null;
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
