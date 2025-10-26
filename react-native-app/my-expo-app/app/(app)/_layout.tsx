import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useSession } from '@/lib/session';
import { View } from 'react-native';
import BottomBar from '@/components/BottomBar';
import { UserCtx } from '@/lib/context/user-context';

export const BOTTOM_BAR_HEIGHT = 72; // keep in sync with BottomBar

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) router.replace('/login');
    if (!session?.user) router.replace('/login');
  }, [session, isLoading]);

  // We render the Stack normally, then overlay our bottom bar on top.
  // Make sure your screens leave space at the bottom (see Screen wrapper below).
  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      {session?.user && (
        <UserCtx.Provider value={session.user}>
          <Stack
            screenOptions={{
              headerTitle: 'InspectEase',
              // optionally hide default headers if you have custom ones
              // headerShown: false,
              // gestureEnabled: true,
            }}
          />
          <BottomBar />
        </UserCtx.Provider>
      )}
    </View>
  );
}
