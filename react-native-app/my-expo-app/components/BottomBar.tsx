import { useEffect, useMemo, useState } from 'react';
import { View, Pressable, Text, Modal, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';
import { DBActionsPublicFetch } from '@/lib/db/public/fetch';
import { ITeamResponse, IUserProfileResponse } from '@/lib/db/public/interfaces';
import { DBActionsBucket } from '@/lib/db/bucket';
import { DBActionsPublicUpdate } from '@/lib/db/public/update';
import { useTeam } from '@/lib/context/team-context';
export const BOTTOM_BAR_HEIGHT = 72;

interface BottomBarProps {
  userId: string;
}

export default function BottomBar({ userId }: BottomBarProps) {
  const { setActiveTeamId, refreshProfile } = useTeam();
  const router = useRouter();
  const publicFetch = new DBActionsPublicFetch(supabase);
  const publicUpdate = new DBActionsPublicUpdate(supabase);
  const bucket = new DBActionsBucket(supabase);

  const [teams, setTeams] = useState<ITeamResponse[]>([]);
  const [userProfile, setUserProfile] = useState<IUserProfileResponse | null>(null);
  const [userProfilePicture, setUserProfilePicture] = useState<string | undefined>(undefined);
  const [teamsProfilePictures, setTeamMemberProfilePictures] = useState<
    Record<string, string | undefined>
  >({});

  const [teamPickerOpen, setTeamPickerOpen] = useState(false);
  const [tempSelectedTeamId, setTempSelectedTeamId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const activeTeam = useMemo(
    () => teams.find((t) => t.id === userProfile?.active_team_id) || null,
    [teams, userProfile?.active_team_id]
  );
  const activeTeamName = activeTeam?.name ?? 'Select team';

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Sign out failed', error.message);
  }

  async function fetchUserProfile() {
    const { userProfile, userProfileError } = await publicFetch.fetchUserProfile(userId);
    if (userProfileError) {
      Alert.alert('Fetch user profile failed', userProfileError.message);
      return;
    }
    if (userProfile) {
      setUserProfile(userProfile);
      setTempSelectedTeamId(userProfile.active_team_id ?? null);

      if (userProfile.picture_id) {
        bucket
          .downloadProfilePicutreViaSignedUrl(userProfile.picture_id)
          .then(({ bucketResponse }) => setUserProfilePicture(bucketResponse?.signedUrl));
      }
    }
  }

  async function fetchTeams() {
    const { teams, teamsError } = await publicFetch.fetchAllTeams();
    if (teamsError) {
      Alert.alert('Fetch teams failed', teamsError.message);
      return;
    }
    if (teams) {
      setTeams(teams);

      const teamMemberProfilePictures: Record<string, string | undefined> = {};
      for (const team of teams) {
        if (team.picture_id) {
          bucket
            .downloadProfilePicutreViaSignedUrl(team.picture_id)
            .then(
              ({ bucketResponse }) =>
                (teamMemberProfilePictures[team.id] = bucketResponse?.signedUrl)
            );
        }
      }
      setTeamMemberProfilePictures(teamMemberProfilePictures);
    }
  }

  // Update the active team for the current user
  async function switchTeam(teamId: string | null) {
    if (!userProfile || !teamId || teamId === userProfile.active_team_id) {
      setTeamPickerOpen(false);
      return;
    }
    try {
      setSwitching(true);
      // Direct Supabase example — adjust table/column names to your schema
      const { updatedProfile, updatedProfileError } = await publicUpdate.switchActiveTeam(
        userId,
        teamId
      );

      if (updatedProfileError) throw updatedProfileError;

      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setActiveTeamId(updatedProfile.active_team_id ?? null);
      }
      // Optimistic local update
      setUserProfile((prev) => (prev ? { ...prev, active_team_id: teamId } : prev));
      setTeamPickerOpen(false);
    } catch (e: any) {
      Alert.alert('Could not switch team', e.message ?? String(e));
    } finally {
      setSwitching(false);
    }
  }

  useEffect(() => {
    fetchTeams();
    fetchUserProfile();
  }, []);

  return (
    <>
      <View className="absolute bottom-0 left-0 right-0 " style={{ height: BOTTOM_BAR_HEIGHT }}>
        <View className=" flex-1 items-center border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {/* Make this container relative so we can overlay the centered FAB */}

          {/* CENTER: Create FAB — absolutely centered over the row */}

          <Pressable
            onPress={() => {
              setTempSelectedTeamId(userProfile?.active_team_id ?? null);
              setTeamPickerOpen(true);
            }}
            className={`mt-2 h-10 w-1/2 flex-row items-center gap-2 rounded-3xl bg-neutral-100 px-3 dark:bg-neutral-900`}
            accessibilityRole="button"
            accessibilityLabel="Select team">
            {teams.length > 0 && userProfile?.active_team_id ? (
              <Image
                source={{ uri: teamsProfilePictures[userProfile.active_team_id] }}
                resizeMode="cover"
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <Ionicons name="people-outline" size={20} />
            )}

            <Text className="flex-1 text-base font-medium" numberOfLines={1}>
              {activeTeamName}
            </Text>
            <Ionicons name="chevron-down" size={18} />
          </Pressable>
        </View>
      </View>

      {/* Native Picker in a modal “select” (instant apply) */}
      <Modal
        animationType="fade"
        transparent
        visible={teamPickerOpen}
        onRequestClose={() => setTeamPickerOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setTeamPickerOpen(false)}>
          <View className="mt-auto w-full rounded-t-2xl bg-white p-4 dark:bg-neutral-900">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Select team</Text>
              {switching ? <ActivityIndicator /> : null}
            </View>

            <Picker
              selectedValue={tempSelectedTeamId ?? undefined}
              onValueChange={(v) => {
                setTempSelectedTeamId(v as string);
                // instant apply
                switchTeam(v as string);
              }}>
              {teams.map((t) => (
                <Picker.Item key={t.id} label={t.name} value={t.id} />
              ))}
            </Picker>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
