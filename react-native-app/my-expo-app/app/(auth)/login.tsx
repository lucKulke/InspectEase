import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, Button } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return Alert.alert('Login failed', error.message);
    router.replace('/'); // success
  }

  async function pingAuth() {
    try {
      const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/settings`;
      const res = await fetch(url, {
        headers: { apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY! },
      });
      console.log('status:', res.status);
      console.log('ok?', res.ok);
      console.log('json:', await res.json());
    } catch (e) {
      console.log('PING ERROR:', e); // If you see TypeError: Network request failed → network/URL issue
    }
  }

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Button title="PING" onPress={pingAuth} color="red"></Button>
      <Text className="mb-6 text-3xl font-bold">Welcome back</Text>

      <TextInput
        className="mb-3 rounded-xl border px-4 py-3"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="mb-4 rounded-xl border px-4 py-3"
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        disabled={loading}
        onPress={signIn}
        className="h-12 items-center justify-center rounded-xl bg-blue-600 active:opacity-80">
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text className="font-semibold text-white">Sign in</Text>
        )}
      </Pressable>

      <View className="mt-4 flex-row gap-1">
        <Text>New here?</Text>
        <Link href="/signup" className="font-semibold text-blue-600">
          Create an account
        </Link>
      </View>
    </View>
  );
}
