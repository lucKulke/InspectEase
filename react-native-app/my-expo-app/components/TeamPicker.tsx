// components/TeamPicker.tsx
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ChevronDown } from 'lucide-react-native';
import type { ITeamResponse } from '@/lib/db/public/interfaces';

export default function TeamPicker({
  teams,
  activeTeamId,
  onChange,
}: {
  teams: ITeamResponse[];
  activeTeamId?: string | null;
  onChange: (teamId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeName = teams.find((t) => t.id === activeTeamId)?.name ?? 'Select team';

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="h-10 w-full flex-row items-center gap-2 rounded-xl bg-neutral-100 px-3 dark:bg-neutral-900">
        <Text className="text-base font-medium" numberOfLines={1}>
          {activeName}
        </Text>
        <ChevronDown size={18} />
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)}>
          <View className="mt-auto w-full rounded-t-2xl bg-white p-12 dark:bg-neutral-900">
            <Picker
              selectedValue={activeTeamId ?? undefined}
              onValueChange={(v) => {
                if (v) onChange(String(v));
              }}>
              {teams.map((t) => (
                <Picker.Item key={t.id} label={t.name} value={t.id} />
              ))}
            </Picker>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
