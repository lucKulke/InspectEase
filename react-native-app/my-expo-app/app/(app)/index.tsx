import { View, Text, Pressable, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function Home() {
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Sign out failed', error.message);
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="mb-6 text-2xl font-bold">You are logged in 🎉</Text>
      <Pressable onPress={signOut} className="rounded-xl bg-black px-4 py-3 active:opacity-80">
        <Text className="font-semibold text-white">Sign out</Text>
      </Pressable>
    </View>
  );
}
