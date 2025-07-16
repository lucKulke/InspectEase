import { SupabaseClient } from "@supabase/supabase-js";

export class FormEngine {
  private formEngineDomain: string = process.env.FORM_ENGINE_DOMAIN!;
  private supabase: SupabaseClient<any, string, any>;
  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async updateSubCheckbox(
    formId: string,
    subCheckboxId: string,
    newValue: boolean
  ) {
    console.log("updateSubCheckbox called");
    // 1. Get user session for auth
    const { data, error } = await this.supabase.auth.getSession();
    if (error || !data.session) {
      throw new Error("User is not authenticated");
    }

    const accessToken = data.session.access_token;

    // 2. Build request
    const url = `http://${this.formEngineDomain}/update-sub-checkbox`;
    const body = {
      form_id: formId,
      checkbox_id: subCheckboxId,
      new_value: newValue,
    };

    // 3. Call backend
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update sub checkbox: ${errorText}`);
    }

    return response.json();
  }
}
