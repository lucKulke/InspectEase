// components/TopBar.tsx
import { View, TextInput, Switch, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFilters } from '@/lib/context/filter-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TopBar() {
  const insets = useSafeAreaInsets();
  const { query, setQuery, showCompleted, setShowCompleted } = useFilters();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <View className="gap-3 px-4 py-3">
        {/* Search input */}
        <View className="flex-row items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 dark:bg-neutral-900">
          <Ionicons name="search" size={18} />
          <TextInput
            className="flex-1 text-base"
            placeholder="Search forms..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Ionicons name="close-circle" size={18} onPress={() => setQuery('')} />
          )}
        </View>

        {/* Toggle row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-neutral-600 dark:text-neutral-300">
            {showCompleted ? 'Showing: Completed' : 'Showing: In progress'}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm">In progress</Text>
            <Switch value={showCompleted} onValueChange={setShowCompleted} />
            <Text className="text-sm">Completed</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
