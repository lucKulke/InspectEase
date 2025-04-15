import { SupabaseClient } from "@supabase/supabase-js";
import {
  ICheckboxGroupInsert,
  ICheckboxGroupResponse,
  IFillableFormInsert,
  IFillableFormResponse,
  IMainCheckboxInsert,
  IMainCheckboxResponse,
  IMainSectionInsert,
  IMainSectionResponse,
  ISubCheckboxInsert,
  ISubCheckboxResponse,
  ISubSectionInsert,
  ISubSectionResponse,
  ITaskInsert,
  ITaskResponse,
  ITextInputInsert,
  ITextInputResponse,
} from "./formFillerInterfaces";
import { SupabaseError } from "@/lib/globalInterfaces";

export class DBActionsFormFillerCreate {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async createNewFillableForm(form: IFillableFormInsert): Promise<{
    form: IFillableFormResponse | null;
    formError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("form")
      .insert(form)
      .select()
      .single();

    console.log("create new fillable form in db:", data);
    if (error) {
      console.error("create new fillable form in db error: ", error);
    }

    return {
      form: data,
      formError: error as SupabaseError | null,
    };
  }
  async createMainSections(sections: IMainSectionInsert[]): Promise<{
    mainSectionsResponse: IMainSectionResponse[] | null;
    mainSectionsResponseError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("main_section")
      .insert(sections)
      .select();

    console.log("create main sections in db:", data);
    if (error) {
      console.error("create main sections in db error: ", error);
    }

    return {
      mainSectionsResponseError: error as SupabaseError | null,
      mainSectionsResponse: data,
    };
  }

  async createSubSections(sections: ISubSectionInsert[]): Promise<{
    subSectionsResponse: ISubSectionResponse[] | null;
    subSectionsResponseError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("sub_section")
      .insert(sections)
      .select();

    console.log("create sub sections in db:", data);
    if (error) {
      console.error("create sub sections in db error: ", error);
    }

    return {
      subSectionsResponseError: error as SupabaseError | null,
      subSectionsResponse: data,
    };
  }

  async createCheckboxGroup(group: ICheckboxGroupInsert[]): Promise<{
    checkboxGroup: ICheckboxGroupResponse[] | null;
    checkboxGroupError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("checkbox_group")
      .insert(group)
      .select();

    console.log("create checkbox group in db:", data);
    if (error) {
      console.error("create checkbox group in db error: ", error);
    }

    return {
      checkboxGroupError: error as SupabaseError | null,
      checkboxGroup: data,
    };
  }

  async createFillableMainCheckboxes(
    checkboxes: IMainCheckboxInsert[]
  ): Promise<{
    mainCheckboxesResponse: IMainCheckboxResponse[] | null;
    mainCheckboxesResponseError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("main_checkbox")
      .insert(checkboxes)
      .select();

    console.log("create new fillable main checkboxes in db:", data);
    if (error) {
      console.error("create new fillable main checkboxes in db error: ", error);
    }

    return {
      mainCheckboxesResponseError: error as SupabaseError | null,
      mainCheckboxesResponse: data,
    };
  }

  async createFillableSubCheckboxes(checkboxes: ISubCheckboxInsert[]): Promise<{
    subCheckboxesResponse: ISubCheckboxResponse[] | null;
    subCheckboxesResponseError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("sub_checkbox")
      .insert(checkboxes)
      .select();

    console.log("create new fillable sub checkboxes in db:", data);
    if (error) {
      console.error("create new fillable sub checkboxes in db error: ", error);
    }

    return {
      subCheckboxesResponseError: error as SupabaseError | null,
      subCheckboxesResponse: data,
    };
  }

  async createFillableTextInputFields(
    textInputFields: ITextInputInsert[]
  ): Promise<{
    textInputFieldsResponse: ITextInputResponse[] | null;
    textInputFieldsResponseError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("text_input")
      .insert(textInputFields)
      .select();

    console.log("create new fillable text input fields in db:", data);
    if (error) {
      console.error(
        "create new fillable text input fields in db error: ",
        error
      );
    }

    return {
      textInputFieldsResponse: data,
      textInputFieldsResponseError: error as SupabaseError | null,
    };
  }

  async createTasks(tasks: ITaskInsert[]): Promise<{
    tasksResponse: ITaskResponse[] | null;
    tasksResponseError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .from("task")
      .insert(tasks)
      .select();

    console.log("create tasks in db:", data);
    if (error) {
      console.error("create tasks in db error: ", error);
    }

    return {
      tasksResponse: data,
      tasksResponseError: error as SupabaseError | null,
    };
  }
}
