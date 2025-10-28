import { View, Alert, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { DBActionsFormFillerFetch } from '@/lib/db/form-filler/fetch';
import { IFillableFormPlusFillableFields } from '@/lib/db/form-filler/interfaces';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useUser } from '@/lib/context/user-context';
import { Redirect } from 'expo-router';
import { DBActionsPublicFetch } from '@/lib/db/public/fetch';
import { IUserProfileResponse } from '@/lib/db/public/interfaces';
import { DBActionsBucket } from '@/lib/db/bucket';
import { BOTTOM_BAR_HEIGHT } from '@/components/BottomBar';
import { useFilters } from '@/lib/context/filter-context';
import FormCard from '@/components/FromCard';
import { useTeam } from '@/lib/context/team-context';
import { useTeamPresence } from '@/lib/hooks/useTeamPresence.native';

export default function Home() {
  const user = useUser();

  if (!user) return <Redirect href="/login" />;
  const { activeTeamId, isTeamReady } = useTeam();
  const [forms, setForms] = useState<IFillableFormPlusFillableFields[]>([]);
  const [teamMembers, setTeamMembers] = useState<IUserProfileResponse[]>([]);
  const [teamMemberProfilePictures, setTeamMemberProfilePictures] = useState<
    Record<string, string | undefined>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // pull-to-refresh flag

  const { byForm, setCurrentForm } = useTeamPresence(
    activeTeamId, // team scope
    user!.id as string, // your user id
    supabase
  );

  async function fetchProfilePictures(members: IUserProfileResponse[]) {
    const bucket = new DBActionsBucket(supabase);
    const profilePictures: Record<string, string | undefined> = {};
    for (const member of members) {
      if (member.picture_id) {
        const { bucketResponse } = await bucket.downloadProfilePicutreViaSignedUrl(
          member.picture_id
        );
        profilePictures[member.user_id] = bucketResponse?.signedUrl;
      }
    }
    setTeamMemberProfilePictures(profilePictures);
  }

  //  accept teamId so we always fetch the right set
  const fetchForms = useCallback(async (teamId: string | null) => {
    const formFillerFetch = new DBActionsFormFillerFetch(supabase);
    // If your fetcher doesn’t support teamId yet, add it there and pass through.
    const { forms, formsError } = await formFillerFetch.fetchAllForms();
    if (formsError) {
      Alert.alert('Fetch forms failed', formsError.message);
      return;
    }
    setForms(forms ?? []);
  }, []);

  async function fetchTeamMembers() {
    const publicFetch = new DBActionsPublicFetch(supabase);
    const { teamMembers, teamMembersError } = await publicFetch.fetchTeamMembers();
    if (teamMembersError) {
      Alert.alert('Fetch team members failed', teamMembersError.message);
      return;
    }
    if (teamMembers) {
      setTeamMembers(teamMembers);
      fetchProfilePictures(teamMembers);
    }
  }

  // initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchForms(activeTeamId ?? null), fetchTeamMembers()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // refetch when team changes
  useEffect(() => {
    if (!isTeamReady) return;
    (async () => {
      setLoading(true);
      await fetchForms(activeTeamId ?? null);
      setLoading(false);
    })();
  }, [activeTeamId, isTeamReady, fetchForms]);

  //  pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchForms(activeTeamId ?? null);
    } finally {
      setRefreshing(false);
    }
  }, [fetchForms, activeTeamId]);

  const { query, showCompleted } = useFilters();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return forms
      .filter((f) => (showCompleted ? !f.in_progress : f.in_progress))
      .filter((f) => {
        if (!q) return true;
        const hay = [f.identifier_string, f.form_type, ...Object.values(f.form_props ?? {})]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
  }, [forms, query, showCompleted]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FormCard
            userId={user.id as string}
            form={item}
            isBeeingEdited={byForm.get(String(item.id)) ?? []}
            teamMembers={teamMembers}
            teamMemberProfilePictures={teamMemberProfilePictures}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: BOTTOM_BAR_HEIGHT + 24,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View className="items-center justify-center py-16" />}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}
