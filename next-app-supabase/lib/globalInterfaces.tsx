import { UUID } from "crypto";

export type RoleType = "owner" | "builder" | "filler";
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
  email: string;
}

export interface ActiveForm {
  formId: string;
  activeUsers: number;
  lastActive: number;
}

export interface WhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface WhisperOutput {
  detected_language: string;
  device: string;
  model: string;
  segments: WhisperSegment[];
  transcription: string;
  translation: string | null;
}

export interface WhisperResponse {
  delayTime: number;
  executionTime: number;
  id: string;
  output: WhisperOutput;
  status: "COMPLETED" | "FAILED" | "IN_PROGRESS";
  workerId: string;
}
