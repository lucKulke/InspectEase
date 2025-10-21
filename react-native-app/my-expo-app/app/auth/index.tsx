import { View } from 'react-native';
import { Link } from 'expo-router';

export default function Page() {
  return (
    <View>
      <Link href="/auth/login">About</Link>
    </View>
  );
}
