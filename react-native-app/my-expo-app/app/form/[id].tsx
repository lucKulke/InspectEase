import { useLocalSearchParams, useFocusEffect, Stack, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView, Pressable } from 'react-native';
import { supabase } from '@/lib/supabase';
import { DBActionsFormFillerFetch } from '@/lib/db/form-filler/fetch';
import { IFillableFormPlusFillableFields } from '@/lib/db/form-filler/interfaces';
import { useUser } from '@/lib/context/user-context';
import { useTeam } from '@/lib/context/team-context';
import { useFormRealtime } from '@/lib/hooks/useFormRealtime.native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AvatarStack } from '@/components/AvatarStack';
import { DBActionsPublicFetch } from '@/lib/db/public/fetch';
import { IUserProfileResponse } from '@/lib/db/public/interfaces';
import { DBActionsBucket } from '@/lib/db/bucket';
import { InspectionFormBoddy } from '@/components/FormBody/InspectionFormBoddy';

export default function FormDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser();
  const formFillerFetch = new DBActionsFormFillerFetch(supabase);
  const publicFetch = new DBActionsPublicFetch(supabase);
  const bucket = new DBActionsBucket(supabase);

  console.log('user', user);
  if (!user) return null;

  const { activeTeamId, userProfile } = useTeam();
  const [form, setForm] = useState<IFillableFormPlusFillableFields | null>(null);
  const [teamMembers, setTeamMembers] = useState<IUserProfileResponse[]>([]);
  const [teamMemberProfilePictures, setTeamMemberProfilePictures] = useState<
    Record<string, string | undefined>
  >({});

  const [loading, setLoading] = useState(true);

  const [offline, setOffline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const handleReconnect = async () => {
    try {
      setReconnecting(true);

      router.replace(`/form/${id}`); // reload same screen (no history push)
    } finally {
      setReconnecting(false);
    }
  };

  // Presence: mark current form when screen focused, clear on blur
  const {
    members,
    memberNames,
    sendSection,
    sectionByUser,
    getUsersInSection,
    getUsersInMainOrSubs,
    sendUserColor,
    sendCursor,
    sendLock,
    channelStatus,
  } = useFormRealtime({
    formId: id,
    teamId: activeTeamId,
    user: { id: user.id as string, name: user.email ?? '' },
    supabase,
    onMainCheckboxUpdate: (id, checked, groupId) => {
      /* update UI */
    },
    onSubCheckboxUpdate: (id, checked, mainId) => {
      /* update UI */
    },
    onTextInputUpdate: (id, value, subId) => {
      /* update UI */
    },
    channelDisconnected: (offline) => {
      /* show banner */
      setOffline(!!offline);
    },
    onPresenceChange: (members) => {
      /* optional */
    },
    onUserColor: ({ user_id, color }) => {
      setTeamMembers((teamMembers) =>
        teamMembers.map((m) => (m.user_id === user_id ? { ...m, color } : m))
      );
    },
  });

  const fetchForm = async () => {
    const { formData, formDataError } = await formFillerFetch.fetchFillableFormData(id); // implement this if you don’t have it
    if (formDataError) Alert.alert('Fetch form failed', formDataError.message);
    console.log('formData', formData);
    setForm(formData ?? null);
  };

  const fetchTeamMembers = async () => {
    const { teamMembers, teamMembersError } = await publicFetch.fetchTeamMembers();
    if (teamMembersError) Alert.alert('Fetch team members failed', teamMembersError.message);
    console.log('teamMembers', teamMembers);
    const members = teamMembers ?? [];
    const profilePictures: Record<string, string | undefined> = {};
    for (const member of members) {
      const { bucketResponse } = await bucket.downloadProfilePicutreViaSignedUrl(
        member.picture_id ?? ''
      );
      if (bucketResponse) {
        profilePictures[member.user_id] = bucketResponse.signedUrl;
      }
    }
    setTeamMemberProfilePictures(profilePictures);
    setTeamMembers(members);
  };

  useEffect(() => {
    setLoading(true);
    fetchForm();
    fetchTeamMembers();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (!form) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-base">Form not found.</Text>
      </View>
    );
  }

  const isDisconnected =
    channelStatus === 'timed_out' || channelStatus === 'closed' || channelStatus === 'error';
  return (
    <>
      <Stack.Screen
        options={{
          title: form?.identifier_string ?? 'Form',
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className="px-2 py-1"
              accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={24} />
            </Pressable>
          ),
          headerRight: () => (
            <AvatarStack
              users={teamMembers.filter(
                (m) => members.find((i) => i.user_id === m.user_id)?.user_id === m.user_id
              )}
              images={teamMemberProfilePictures}
            />
          ),
        }}
      />
      <View className={` h-2 animate-pulse ${isDisconnected ? 'bg-amber-100' : ' bg-green-200'}`} />

      {offline && (
        <View className="border-b border-amber-300 bg-amber-100">
          <View className="flex-row items-center justify-between px-4 py-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="warning-outline" size={18} color="#92400E" />
              <Text className="text-amber-900">Realtime disconnected.</Text>
            </View>
            <Pressable
              disabled={reconnecting}
              onPress={handleReconnect}
              className="rounded-md bg-amber-600 px-3 py-1.5"
              accessibilityRole="button"
              accessibilityLabel="Reconnect realtime">
              {reconnecting ? (
                <Text className="text-white">Reconnecting…</Text>
              ) : (
                <Text className="text-white">Reconnect</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
      <InspectionFormBoddy></InspectionFormBoddy>
    </>
  );
}
