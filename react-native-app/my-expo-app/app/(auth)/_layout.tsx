import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useSession } from '@/lib/session';

export default function AuthLayout() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session) router.replace('/'); // already logged in
  }, [session, isLoading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
