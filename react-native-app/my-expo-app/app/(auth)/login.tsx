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

  return (
    <View className="flex-1 justify-center bg-white px-6">
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
