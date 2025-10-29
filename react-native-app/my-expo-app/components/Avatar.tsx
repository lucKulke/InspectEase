import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { DBActionsPublicFetch } from '@/lib/db/public/fetch';
import { useUser } from '@/lib/context/user-context';
import { DBActionsBucket } from '@/lib/db/bucket';

type UserProfile = {
  name: string;
  email: string;
  avatarUrl?: string | null;
};

type AvatarProps = {
  /** Size in px. Default 48 */
  size?: number;
  /** Roundness; "rounded-full" by default */
  roundedClass?: string;
  /**
   * API endpoint returning { name, email, avatarUrl? }
   * Defaults to "/api/me". Adjust to your backend.
   */
  profileUrl?: string;
  /**
   * Optional extra fetch options (headers, etc.)
   * Example: { headers: { Authorization: `Bearer ${token}` } }
   */
  fetchOptions?: RequestInit;
};

export default function Avatar({
  size = 38,
  roundedClass = 'rounded-full',
  profileUrl = '/api/me',
  fetchOptions,
}: AvatarProps) {
  const user = useUser();
  if (!user) {
    return null;
  }
  const publicFetch = new DBActionsPublicFetch(supabase);
  const bucket = new DBActionsBucket(supabase);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Fetch profile ON MOUNT
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        if (!user) return;

        const { userProfile, userProfileError } = await publicFetch.fetchUserProfile(user.id);

        if (userProfileError) {
          throw userProfileError;
        }
        if (!userProfile) return;

        const { bucketResponse } = await bucket.downloadProfilePicutreViaSignedUrl(
          userProfile.picture_id ?? ''
        );

        var name = userProfile.first_name + ' ' + userProfile.last_name;

        // If your API uses different field names, adapt the mapping here:
        const next: UserProfile = {
          name: name,
          email: userProfile.email ?? '',
          avatarUrl: bucketResponse?.signedUrl,
        };

        if (!cancelled) setProfile(next);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [profileUrl, fetchOptions]);

  const initials = useMemo(() => {
    const n = (profile?.name ?? '').trim();
    if (!n) return '';
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
  }, [profile?.name]);

  const px = {
    width: size,
    height: size,
    borderRadius: roundedClass === 'rounded-full' ? size / 2 : undefined,
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        className={`bg-gray-100 ${roundedClass} items-center justify-center overflow-hidden`}
        style={px}
        accessibilityRole="button"
        accessibilityLabel="Open profile">
        {loading ? (
          <ActivityIndicator />
        ) : profile?.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={px} resizeMode="cover" />
        ) : initials ? (
          <View className={`bg-black/90 ${roundedClass} h-full w-full items-center justify-center`}>
            <Text className="font-semibold text-white" style={{ fontSize: size * 0.42 }}>
              {initials}
            </Text>
          </View>
        ) : (
          <Ionicons name="person-circle-outline" size={size * 0.9} color="#9ca3af" />
        )}
      </TouchableOpacity>

      {/* Info modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Dimmed overlay */}
        <View className="flex-1 bg-black/40">
          {/* Tap outside to close */}
          <Pressable onPress={() => setOpen(false)} className="absolute inset-0" />

          {/* Centered card */}
          <View className="flex-1 items-center justify-center px-6">
            <View
              className="w-11/12 rounded-2xl bg-white p-6"
              style={{
                maxWidth: 420,
                elevation: 8,
                shadowOpacity: 0.2,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
              }}>
              {/* Close (top-right) */}
              <TouchableOpacity
                onPress={() => setOpen(false)}
                className="absolute right-3 top-3 rounded-full bg-gray-100 p-2"
                accessibilityRole="button"
                accessibilityLabel="Close profile">
                <Ionicons name="close" size={18} color="#111827" />
              </TouchableOpacity>

              {/* Avatar big + centered */}
              <View className="items-center">
                <View
                  className="items-center justify-center overflow-hidden rounded-full bg-gray-100"
                  style={{ width: 96, height: 96 }}>
                  {profile?.avatarUrl ? (
                    <Image
                      source={{ uri: profile.avatarUrl }}
                      style={{ width: 96, height: 96 }}
                      resizeMode="cover"
                    />
                  ) : initials ? (
                    <View className="h-full w-full items-center justify-center rounded-full bg-black/90">
                      <Text className="text-3xl font-semibold text-white">{initials}</Text>
                    </View>
                  ) : (
                    <Ionicons name="person-circle-outline" size={88} color="#9ca3af" />
                  )}
                </View>

                {/* Name + email centered */}
                <Text className="mt-4 text-center text-xl font-semibold" numberOfLines={1}>
                  {profile?.name || '—'}
                </Text>
                <Text className="mt-1 text-center text-gray-600" numberOfLines={1}>
                  {profile?.email || '—'}
                </Text>

                {error ? (
                  <Text className="mt-2 text-center text-xs text-red-600">{error}</Text>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
