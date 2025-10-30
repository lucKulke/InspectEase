import { IUserProfileResponse } from '@/lib/db/public/interfaces';
import { useMemo, useState } from 'react';
import { FlatList, Image, Modal, Pressable, Text, View } from 'react-native';

export function AvatarStack({
  users,
  images,
  size = 34,
  title = 'Currently editing',
  onUserPress,
}: {
  users: IUserProfileResponse[];
  images: Record<string, string | undefined>;
  size?: number;
  title?: string;
  onUserPress?: (user: IUserProfileResponse) => void;
}) {
  const [open, setOpen] = useState(false);
  const visible = users.slice(0, 3);
  const extra = users.length - visible.length;

  if (users.length === 0) return null;

  return (
    <>
      {/* Collapsed stack */}
      <Pressable className="flex-row" onPress={() => setOpen(true)} accessibilityRole="button">
        {visible.map((u, idx) => {
          return (
            <View
              key={u.user_id}
              style={{ marginLeft: idx === 0 ? 0 : -size / 3 }}
              className="relative overflow-hidden rounded-full border border-white bg-white dark:border-neutral-900">
              {images[u.user_id] ? (
                <Image
                  source={{ uri: images[u.user_id]! }}
                  style={{ width: size, height: size, borderRadius: size / 2 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{ width: size, height: size, borderRadius: size / 2 }}
                  className="items-center justify-center bg-neutral-300">
                  <Text className="text-[10px] font-semibold">
                    {getInitials(
                      (u.first_name ? `${u.first_name} ` : '') + (u.last_name ?? '') || u.email
                    )}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
        {extra > 0 && (
          <View
            style={{ marginLeft: -size / 3, width: size, height: size, borderRadius: size / 2 }}
            className="items-center justify-center border border-white bg-neutral-300 dark:border-neutral-900">
            <Text className="text-[10px] font-semibold">+{extra}</Text>
          </View>
        )}
      </Pressable>

      {/* Expanded list modal */}
      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)}>
          <View className="mt-auto w-full rounded-t-2xl bg-white p-4 dark:bg-neutral-900">
            <Text className="mb-3 text-lg font-semibold">{title}</Text>

            <FlatList
              data={users}
              keyExtractor={(u) => u.user_id}
              ItemSeparatorComponent={() => (
                <View className="h-[1px] bg-neutral-200 dark:bg-neutral-800" />
              )}
              renderItem={({ item }) => {
                const color = getUserColor(item);
                return (
                  <Pressable
                    className="flex-row items-center gap-3 py-3"
                    onPress={() => {
                      onUserPress?.(item);
                      setOpen(false);
                    }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        overflow: 'hidden',
                      }}>
                      <Avatar
                        uri={images[item.user_id]}
                        label={
                          (item.first_name ? `${item.first_name} ` : '') + (item.last_name ?? '') ||
                          item.email
                        }
                        size={32}
                      />
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        {/* color chip */}
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: color,
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                          }}
                        />
                        <Text className="text-base" numberOfLines={1}>
                          {displayName(item)}
                        </Text>
                      </View>
                      {!!item.email && (
                        <Text className="text-xs text-neutral-500" numberOfLines={1}>
                          {item.email}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              }}
              style={{ maxHeight: 320 }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

/** Small avatar with initials fallback */
function Avatar({ uri, label, size = 28 }: { uri?: string; label: string; size?: number }) {
  const initials = useMemo(() => getInitials(label), [label]);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    );
  }
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center bg-neutral-300">
      <Text className="text-[10px] font-semibold">{initials}</Text>
    </View>
  );
}

function displayName(u: IUserProfileResponse) {
  const full = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
  return full.length > 0 ? full : (u.email ?? 'Unknown user');
}

function getInitials(name?: string) {
  if (!name) return '';
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Grab a color off the profile with safe fallbacks */
function getUserColor(u: IUserProfileResponse) {
  // Adjust field name(s) to your schema if needed:
  // e.g. u.profile_color, u.user_color, u.color_hex, etc.
  const c = u.color ?? '#9CA3AF';
  // neutral fallback
  return String(c);
}
