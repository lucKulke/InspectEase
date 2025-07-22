import { SupabaseClient } from "@supabase/supabase-js";

export class FormEngine {
  private formEngineDomain: string = process.env.FORM_ENGINE_DOMAIN!;
  private enviroment: string = process.env.APP_ENVIROMENT!;
  private supabase: SupabaseClient<any, string, any>;
  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  private async callFormEngine(url: string, body: any) {
    const { data, error } = await this.supabase.auth.getSession();
    if (error || !data.session) {
      throw new Error("User is not authenticated");
    }

    const accessToken = data.session.access_token;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });
    return response;
  }

  async updateSubCheckbox(
    formId: string,
    subCheckboxId: string,
    newValue: boolean
  ) {
    // 1. Build request
    const url = `http${this.enviroment === "development" ? "" : "s"}://${
      this.formEngineDomain
    }/manual-update-checkbox/sub-checkbox`;
    const body = {
      form_id: formId,
      checkbox_id: subCheckboxId,
      new_value: newValue,
    };

    // 2. Call api
    const response = await this.callFormEngine(url, body);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update sub checkbox: ${errorText}`);
    }

    return response.json();
  }

  async updateMainCheckbox(
    formId: string,
    mainCheckboxId: string,
    newValue: boolean
  ) {
    // 1. Build request
    const url = `http${this.enviroment === "development" ? "" : "s"}://${
      this.formEngineDomain
    }/manual-update-checkbox/main-checkbox`;
    const body = {
      form_id: formId,
      checkbox_id: mainCheckboxId,
      new_value: newValue,
    };

    // 2. Call api
    const response = await this.callFormEngine(url, body);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update main checkbox: ${errorText}`);
    }

    return response.json();
  }
}
