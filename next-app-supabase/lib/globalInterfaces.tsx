export interface SupabaseError {
  code: string;
  details: string | null;
  hint: string | null;
  message: string;
}
