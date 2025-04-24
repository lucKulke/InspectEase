import { UUID } from "crypto";

export interface SupabaseError {
  code: string;
  details: string | null;
  hint: string | null;
  message: string;
}

export interface StorageError {
  code: string;
  message: string;
}

export interface AnnotationData {
  pageNumber: number;
  type: string;
  rect: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  contents: string;
}

export interface AnnotationsApiResponse {
  annotations: AnnotationData[];
  filename: string;
  status: string;
}

export interface IUserProfile {
  user_id: UUID;
  first_name: string;
  last_name: string;
  openai_token: string;
}

export interface ActiveForm {
  formId: string;
  activeUsers: number;
  lastActive: number;
}
