import { useLocalSearchParams, useFocusEffect, Stack, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView, Pressable } from 'react-native';
import { supabase } from '@/lib/supabase';
import { DBActionsFormFillerFetch } from '@/lib/db/form-filler/fetch';
import { IFillableFormPlusFillableFields } from '@/lib/db/form-filler/interfaces';
import { useUser } from '@/lib/context/user-context';
import { useTeam } from '@/lib/context/team-context';
import { useFormRealtime } from '@/lib/hooks/useFormRealtime.native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function FormDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser();

  console.log('user', user);
  if (!user) return null;

  const { activeTeamId } = useTeam();
  const [form, setForm] = useState<IFillableFormPlusFillableFields | null>(null);
  const [loading, setLoading] = useState(true);

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
    },
    onPresenceChange: (members) => {
      /* optional */
    },
    onUserColor: ({ user_id, color }) => {
      /* optional */
    },
  });
  useEffect(() => {
    (async () => {
      setLoading(true);
      const formFillerFetch = new DBActionsFormFillerFetch(supabase);
      const { formData, formDataError } = await formFillerFetch.fetchFillableFormData(id); // implement this if you don’t have it
      if (formDataError) Alert.alert('Fetch form failed', formDataError.message);
      setForm(formData ?? null);
      setLoading(false);
    })();
  }, [id]);

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

  return (
    <>
      <Stack.Screen
        options={{
          title: form?.identifier_string ?? 'Form',
          headerLeft: () => (
            <Pressable
              onPress={() => router.push('/')}
              className="px-2 py-1"
              accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={24} />
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 16 }}>
        <Text className="mb-2 text-xl font-semibold">
          {form.identifier_string} • {form.form_type}
        </Text>

        {/* Render your form fields here */}
        {/* e.g., map sections -> subsections -> inputs, with NativeWind styling */}
      </ScrollView>
    </>
  );
}
