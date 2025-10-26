import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useSession } from '@/lib/session';

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) router.replace('/login');
  }, [session, isLoading]);

  return <Stack screenOptions={{ headerTitle: 'My App' }} />;
}
