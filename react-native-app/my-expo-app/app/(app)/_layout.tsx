// app/_layout.tsx
import { Stack, Redirect } from 'expo-router';
import { useSession } from '@/lib/session';
import { View, ActivityIndicator } from 'react-native';
import BottomBar from '@/components/BottomBar';
import { UserCtx } from '@/lib/context/user-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TopBar from '@/components/TopBar';
import { FilterProvider } from '@/lib/context/filter-context';
import { useEffect } from 'react';
import { TeamProvider } from '@/lib/context/team-context';

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const user = session?.user ?? null;

  if (!user) return <Redirect href="/login" />;
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
          <ActivityIndicator />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <UserCtx.Provider value={user}>
        {user ? (
          <TeamProvider userId={user.id}>
            <FilterProvider>
              <View className="flex-1 bg-white dark:bg-neutral-950">
                <Stack />
                <BottomBar userId={user.id} />
              </View>
            </FilterProvider>
          </TeamProvider>
        ) : null}
      </UserCtx.Provider>
    </SafeAreaProvider>
  );
}
