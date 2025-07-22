"use server";

import { DatabasePublicCreate } from "@/lib/database/public/publicCreate";
import { DatabasePublicDelete } from "@/lib/database/public/publicDelete";
import { DBActionsPublicFetch } from "@/lib/database/public/publicFetch";
import { ITeamInsert } from "@/lib/database/public/publicInterface";
import { createClient } from "@/utils/supabase/server";

export async function createNewTeam(team: ITeamInsert) {
  const supabase = await createClient();
  const publicCreate = new DatabasePublicCreate(supabase);
  const { newTeam, newTeamError } = await publicCreate.createNewTeam(team);
  if (newTeamError) {
    return { newTeam: null, newTeamError };
  } else if (newTeam) {
    const { teamMembership, teamMembershipError } =
      await publicCreate.createTeamMembership(newTeam.id, team.owner_id);
    if (teamMembershipError) {
      return { newTeam: null, newTeamError: teamMembershipError };
    } else if (teamMembership) {
      const publicFetch = new DBActionsPublicFetch(supabase);
      const { team, teamError } = await publicFetch.fetchTeamById(newTeam.id);
      return { newTeam: team, newTeamError: teamError };
    }
  }
  return { newTeam: null, newTeamError };
}

export async function leaveTeam(teamId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      deletedTeamMembership: null,
      deletedTeamMembershipError: null,
    };
  const publicUpdate = new DatabasePublicDelete(supabase);
  return await publicUpdate.delteTeamMembership(user.id, teamId);
}
