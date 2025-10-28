// app/form/_layout.tsx
import { Redirect, Stack, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable } from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'lucide-react-native';
import { useSession } from '@/lib/session';
import { UserCtx } from '@/lib/context/user-context';
import { TeamProvider } from '@/lib/context/team-context';
import { FilterProvider } from '@/lib/context/filter-context';

export default function FormLayout() {
  const { session, isLoading } = useSession();
  const user = session?.user ?? null;

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }
  const router = useRouter();
  return (
    <SafeAreaProvider>
      <UserCtx.Provider value={user}>
        {user ? (
          <TeamProvider userId={user.id}>
            <FilterProvider>
              <Stack />
            </FilterProvider>
          </TeamProvider>
        ) : null}
        {!user ? <Redirect href="/login" /> : null}
      </UserCtx.Provider>
    </SafeAreaProvider>
  );
}
