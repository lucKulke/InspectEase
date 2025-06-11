import { UUID } from "crypto";

export interface ITeamResponse {
  id: string;
  name: string;
  created_by: string;
  description: string | null;
  picture_id: UUID | null;
}

export interface IUserProfileResponse {
  created_at: Date | string;
  user_id: UUID;
  first_name: string;
  last_name: string;
  openai_token: string;
  role: "admin" | "normal";
  active_team_id: UUID | null;
}

export interface IUserProfileEmailResponse {
  id: UUID;
  email: string;
}
