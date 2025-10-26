export type RoleType = 'owner' | 'builder' | 'filler';

export interface IUserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}
export interface ITeamInsert {
  name: string;
  description: string | null;
  owner_id: string;
}
export interface ITeamResponse extends ITeamInsert {
  id: string;
  created_at: string;
  picture_id: string | null;
  openai_token: string;
  deepgram_token: string;
  require_two_factor: boolean;
}

export interface ITeamSettings {
  name: string;
  description: string;
  require_two_factor: boolean;
}

export interface IUserProfileResponse {
  created_at: Date | string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  active_team_id: string | null;
  picture_id: string | null;
  color: string | null;
}

export interface ITeamMembershipsInsert {
  team_id: string;
  user_id: string;
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
  team_id: string;
  user_id: string;
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
