import { View, Text, Pressable, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import {
  DBActionsFormFillerFetch,
  IFillableFormPlusFillableFields,
} from '@/lib/db/form-filler/fetch';
import { useEffect, useState } from 'react';
import FormCard from '@/components/FromCard';
import { useUser } from '@/lib/context/user-context';
import { router } from 'expo-router';
import { DBActionsPublicFetch } from '@/lib/db/public/fetch';
import { IUserProfileResponse } from '@/lib/db/public/interfaces';

export default function Home() {
  const [forms, setForms] = useState<IFillableFormPlusFillableFields[]>([]);
  const [teamMembers, setTeamMembers] = useState<IUserProfileResponse[]>([]);
  const user = useUser();

  if (!user) router.replace('/login');
  async function fetchForms() {
    const formFillerFetch = new DBActionsFormFillerFetch(supabase);
    const { forms, formsError } = await formFillerFetch.fetchAllForms();
    if (formsError) {
      Alert.alert('Fetch forms failed', formsError.message);
      return;
    } else if (forms) setForms(forms);
  }

  async function fetchTeamMembers() {
    const publicFetch = new DBActionsPublicFetch(supabase);
    const { teamMembers, teamMembersError } = await publicFetch.fetchTeamMembers();
    if (teamMembersError) {
      Alert.alert('Fetch team members failed', teamMembersError.message);
      return;
    } else if (teamMembers) {
      setTeamMembers(teamMembers);
    }
  }

  useEffect(() => {
    fetchForms();
    fetchTeamMembers();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="mb-6 text-2xl font-bold">
        You are logged in 🎉 <FontAwesome6 name="comments" />;
      </Text>
      {forms.map((form) => (
        <FormCard
          userId={user.id}
          form={form}
          key={form.id}
          isBeeingEdited={[]}
          teamMembers={teamMembers}
        />
      ))}
    </View>
  );
}
