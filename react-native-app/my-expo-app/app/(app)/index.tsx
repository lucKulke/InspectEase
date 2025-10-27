import { View, Alert, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import {
  DBActionsFormFillerFetch,
  IFillableFormPlusFillableFields,
} from '@/lib/db/form-filler/fetch';
import { useEffect, useState } from 'react';
import { useUser } from '@/lib/context/user-context';
import { Redirect } from 'expo-router';
import { DBActionsPublicFetch } from '@/lib/db/public/fetch';
import { IUserProfileResponse } from '@/lib/db/public/interfaces';
import { DBActionsBucket } from '@/lib/db/bucket';
import { BOTTOM_BAR_HEIGHT } from '@/components/BottomBar';
import { useMemo } from 'react';
import { useFilters } from '@/lib/context/filter-context';
import FormCard from '@/components/FromCard';

export default function Home() {
  const [forms, setForms] = useState<IFillableFormPlusFillableFields[]>([]);
  const [teamMembers, setTeamMembers] = useState<IUserProfileResponse[]>([]);
  const [teamMemberProfilePictures, setTeamMemberProfilePictures] = useState<
    Record<string, string | undefined>
  >({});
  const [loading, setLoading] = useState(true);
  const user = useUser();

  if (!user) return <Redirect href="/login" />;

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

  async function fetchForms() {
    const formFillerFetch = new DBActionsFormFillerFetch(supabase);
    const { forms, formsError } = await formFillerFetch.fetchAllForms();
    if (formsError) {
      Alert.alert('Fetch forms failed', formsError.message);
      return;
    }
    if (forms) setForms(forms);
  }

  async function fetchTeamMembers() {
    const publicFetch = new DBActionsPublicFetch(supabase);
    const { teamMembers, teamMembersError } = await publicFetch.fetchTeamMembers();
    if (teamMembersError) {
      Alert.alert('Fetch team members failed', teamMembersError.message);
      return;
    }
    if (teamMembers) {
      setTeamMembers(teamMembers);
      // get pictures right after members arrive
      fetchProfilePictures(teamMembers);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchForms(), fetchTeamMembers()]);
      setLoading(false);
    })();
  }, []);

  const { query, showCompleted } = useFilters();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return forms
      .filter((f) => (showCompleted ? !f.in_progress : f.in_progress))
      .filter((f) => {
        if (!q) return true;
        // match against identifier, type, or metadata
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
            isBeeingEdited={[]}
            teamMembers={teamMembers}
            teamMemberProfilePictures={teamMemberProfilePictures}
          />
        )}
        // 👇 spacing between cards
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        // 👇 nice outer padding + bottom padding so the last card clears the bottom bar
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: BOTTOM_BAR_HEIGHT + 24,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <View>
              <View className="mb-2" />
              <View className="items-center">
                <View className="mb-2" />
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
}
