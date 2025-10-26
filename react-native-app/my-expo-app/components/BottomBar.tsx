import { useState } from 'react';
import { View, Pressable, Text, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { BOTTOM_BAR_HEIGHT } from '@/app/(app)/_layout';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '@/lib/supabase';

export default function BottomBar() {
  const router = useRouter();
  const [teamOpen, setTeamOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Sign out failed', error.message);
  }

  return (
    <>
      <View className="absolute bottom-0 left-0 right-0" style={{ height: BOTTOM_BAR_HEIGHT }}>
        <View className="flex-1 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <View className="flex-1 flex-row items-center justify-between px-5">
            {/* Team Switcher */}
            <Pressable
              onPress={() => setTeamOpen(true)}
              className="h-10 flex-row items-center gap-2 rounded-xl px-3">
              <Ionicons name="people-outline" size={22} />
              <Text className="text-base font-medium">Team</Text>
            </Pressable>

            {/* Big Create Button */}
            <Pressable
              onPress={() => router.push('/create')}
              className="-mt-12 h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg"
              style={{ elevation: 6 }}>
              <Ionicons name="add" size={32} color="#fff" />
            </Pressable>

            {/* Right cluster: Settings + Avatar */}
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => router.push('/settings')}
                className="h-10 w-10 items-center justify-center rounded-full">
                <Ionicons name="settings-outline" size={22} />
              </Pressable>

              <Pressable
                onPress={() => setProfileOpen(true)}
                className="h-10 w-10 overflow-hidden rounded-full border border-neutral-300 dark:border-neutral-700">
                {/* Replace with your user image */}
                <Image
                  source={{ uri: 'https://i.pravatar.cc/100?img=3' }}
                  resizeMode="cover"
                  className="h-full w-full"
                />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Team Switcher Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={teamOpen}
        onRequestClose={() => setTeamOpen(false)}>
        <Pressable className="flex-1 items-start bg-black/40" onPress={() => setTeamOpen(false)}>
          <View className="mt-auto w-1/2 px-4 pb-6">
            <View className="mb-16 rounded-2xl bg-white p-4 dark:bg-neutral-900">
              <Text className="mb-2 text-lg font-semibold">Switch Team</Text>
              {/* Example teams; wire these up to your data */}
              {['Alpha', 'Beta', 'Gamma'].map((team) => (
                <Pressable
                  key={team}
                  onPress={() => {
                    // TODO: call your team switch action
                    setTeamOpen(false);
                  }}
                  className="py-3">
                  <Text className="text-base">{team}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Profile Menu Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={profileOpen}
        onRequestClose={() => setProfileOpen(false)}>
        <Pressable className="flex-1 items-end bg-black/40" onPress={() => setProfileOpen(false)}>
          <View className="mb-16 mt-auto w-1/2 px-4 pb-6">
            <View className="rounded-3xl bg-white p-4 dark:bg-neutral-900">
              <Text className="mb-2 text-lg font-semibold">Account</Text>
              <Pressable
                className="py-3"
                onPress={() => {
                  setProfileOpen(false);
                  router.push('/profile');
                }}>
                <Text className="text-base">View profile</Text>
              </Pressable>
              <Pressable
                className="py-3"
                onPress={() => {
                  setProfileOpen(false);
                  router.push('/billing'); // optional
                }}>
                <Text className="text-base">Billing</Text>
              </Pressable>
              <Pressable
                className="py-3"
                onPress={() => {
                  setProfileOpen(false);
                  signOut();
                  // call your sign out method from useSession()
                  // e.g., signOut();
                }}>
                <Text className="text-base text-red-600">Sign out</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
