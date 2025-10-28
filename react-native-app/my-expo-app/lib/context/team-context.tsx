// lib/context/team-context.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { DBActionsPublicFetch } from '@/lib/db/public/fetch';
import type { IUserProfileResponse } from '@/lib/db/public/interfaces';

type TeamCtx = {
  activeTeamId: string | null;
  isTeamReady: boolean; // true when we've loaded the profile at least once
  setActiveTeamId: (id: string | null) => void;
  refreshProfile: () => Promise<void>;
  userProfile: IUserProfileResponse | null;
};

const TeamContext = createContext<TeamCtx | null>(null);

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}

export function TeamProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<IUserProfileResponse | null>(null);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [isTeamReady, setIsTeamReady] = useState(false);

  const refreshProfile = useCallback(async () => {
    const publicFetch = new DBActionsPublicFetch(supabase);
    const { userProfile, userProfileError } = await publicFetch.fetchUserProfile(userId);
    if (userProfileError) {
      Alert.alert('Fetch user profile failed', userProfileError.message);
    } else {
      setUserProfile(userProfile ?? null);
      setActiveTeamId(userProfile?.active_team_id ?? null);
    }
  }, [userId]);

  useEffect(() => {
    (async () => {
      await refreshProfile();
      setIsTeamReady(true);
    })();
  }, [refreshProfile]);

  const value: TeamCtx = {
    userProfile,
    activeTeamId,
    isTeamReady,
    setActiveTeamId, // optimistic changes allowed; you can also call refreshProfile after a DB write
    refreshProfile,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}
