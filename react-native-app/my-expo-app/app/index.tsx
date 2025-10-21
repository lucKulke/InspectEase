import 'global.css';
import { View, Text, StyleSheet, Button, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Ey Eddy du kek</Text>

      <Pressable
        className="mt-4 rounded-xl bg-blue-500 px-4 py-3 active:opacity-80"
        onPress={() => router.navigate('auth/login')}>
        <Text className="font-semibold text-white">Login</Text>
      </Pressable>
    </View>
  );
}
