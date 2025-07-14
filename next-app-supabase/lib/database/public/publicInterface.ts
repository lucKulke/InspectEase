import { RoleType } from "@/lib/globalInterfaces";
import { UUID } from "crypto";

export interface ITeamInsert {
  name: string;
  description: string | null;
  owner_id: UUID;
}
export interface ITeamResponse extends ITeamInsert {
  id: string;
  created_at: string;
  picture_id: UUID | null;
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

export interface ITeamMembershipsInsert {
  team_id: UUID;
  user_id: UUID;
}
export interface ITeamMembershipsResponse extends ITeamMembershipsInsert {
  created_at: Date | string;

  disabled: boolean;
  role: RoleType[];
}

export interface IUserApiKeysResponse {
  openai_token: string | null;
  anthropic_token: string | null;
  deepgram_token: string | null;
}

export interface IMemberRequestInsert {
  team_id: UUID;
  user_id: UUID;
  email: string;
}

export interface IMemberRequestResponse extends IMemberRequestInsert {
  created_at: Date | string;
}

export interface ITeamMembershipsWithUser extends ITeamMembershipsResponse {
  user_profile: IUserProfileResponse;
}

export interface ITeamAndTeamMembers extends ITeamResponse {
  team_memberships: ITeamMembershipsWithUser[];
}
