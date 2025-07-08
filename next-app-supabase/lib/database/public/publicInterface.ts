import { RoleType } from "@/lib/globalInterfaces";
import { UUID } from "crypto";

export interface ITeamResponse {
  id: string;
  name: string;
  created_by: string;
  description: string | null;
  picture_id: UUID | null;
  owner_id: UUID;
  openai_token: string;
  deepgram_token: string;
  require_two_factor: boolean;
}

export interface IUserProfileResponse {
  created_at: Date | string;
  user_id: UUID;
  first_name: string;
  last_name: string;
  email: string;
  active_team_id: UUID | null;
}

export interface ITeamMembershipsResponse {
  user_id: UUID;
  team_id: UUID;
  created_at: Date | string;
  accepted: boolean;
  disabled: boolean;
  role: RoleType[];
}

export interface IUserApiKeysResponse {
  openai_token: string | null;
  anthropic_token: string | null;
  deepgram_token: string | null;
}
