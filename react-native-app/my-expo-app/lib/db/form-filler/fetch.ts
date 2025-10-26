import { SupabaseError } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export class DBActionsFormFillerFetch {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async fetchAllForms(): Promise<{
    forms: IFillableFormPlusFillableFields[] | null;
    formsError: SupabaseError | null;
  }> {
    const { data, error } = await this.supabase
      .schema('form_filler')
      .from('form')
      .select(
        `*, main_section(sub_section(text_input(value),checkbox_group(main_checkbox(checked,sub_checkbox(checked)))))`
      );

    console.log('fetch all fillable form in db:', data);
    if (error) {
      console.error('fetch all fillable form in db error: ', error);
    }

    return {
      forms: data,
      formsError: error as SupabaseError | null,
    };
  }
}

interface IText {
  value: string | null;
}

interface ISubCheckbox {
  checked: boolean;
}
interface IMainCheckbox {
  checked: boolean;
  sub_checkbox: ISubCheckbox[];
}
interface IGroup {
  main_checkbox: IMainCheckbox[];
}

interface ISub {
  text_input: IText[];
  checkbox_group: IGroup[];
}

interface IMain {
  sub_section: ISub[];
}

export interface IFillableFormPlusFillableFields extends IFillableFormResponse {
  main_section: IMain[];
}

export interface IFillableFormInsert {
  build_id: string;
  identifier_string: string;
  object_profile_name: string;
  object_profile_icon: string;
  object_props: Record<string, string>;
  form_type: string;
  form_props: Record<string, string>;
  document_id: string;
}

export interface IFillableFormResponse extends IFillableFormInsert {
  id: string;
  created_at: Date | string;
  in_progress: boolean;
  updated_at: Date | string;
}
