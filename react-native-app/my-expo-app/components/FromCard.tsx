import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Modal,
  ScrollView,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { FileDown, Settings2, Trash2, Users2 } from 'lucide-react-native';
import { IUserProfileResponse } from '@/lib/db/public/interfaces';
import { IconType, profileIcons } from '@/lib/availableIcons';
/**
 * NOTE:
 * - Styling uses NativeWind (className).
 * - Icons use lucide-react-native (install: `npm i lucide-react-native`).
 * - This file inlines light-weight replacements for web-only UI (ContextMenu, HoverCard, ScrollArea).
 * - Replace `any` types with your app interfaces if you have them in RN as well.
 */

// --------------------
// Types
// --------------------
export type UUID = string;

export interface IFillableFormPlusFillableFields {
  id: UUID;
  build_id: UUID;
  identifier_string: string;
  form_type: string;
  updated_at?: string | Date;
  created_at: string | Date;
  in_progress: boolean;
  object_profile_icon?: IconType;
  object_profile_name?: string;
  object_props: Record<string, string>;
  form_props: Record<string, string>;
  main_section: Array<{
    sub_section: Array<{
      text_input: Array<{ value?: string | null }>;
      checkbox_group: Array<{
        main_checkbox: Array<{ checked?: boolean }>;
      }>;
    }>;
  }>;
}

interface FormCardProps {
  userId: string;
  form: IFillableFormPlusFillableFields;
  selectedForm?: UUID;
  setSelectedForm?: React.Dispatch<React.SetStateAction<UUID | undefined>>;
  setOpenAlertDialog?: React.Dispatch<React.SetStateAction<boolean>>;

  isBeeingEdited: string[]; // user_id[]
  teamMembers: IUserProfileResponse[] | null;
  teamMemberProfilePictures: Record<UUID, string | undefined>;
  // Inject actions for RN (instead of Next.js server actions)
  updateFormProgressState?: (
    id: UUID,
    value: boolean
  ) => Promise<{
    updatedForm?: IFillableFormPlusFillableFields;
    updatedFormError?: { message: string; code?: string };
  }>;
  fillPDF?: (form: IFillableFormPlusFillableFields) => Promise<{ uri?: string; error?: string }>; // Share/Save handled by caller
  onDelete?: (id: UUID) => Promise<void> | void;
}

export default function FormCard({
  userId,
  form,
  selectedForm,
  setSelectedForm,
  setOpenAlertDialog,

  isBeeingEdited,
  teamMembers,
  teamMemberProfilePictures,
  updateFormProgressState,
  fillPDF,
  onDelete,
}: FormCardProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // --------------------
  // Derived state (progress)
  // --------------------
  const { progress, completed, filled, max } = useMemo(() => {
    let _filled = 0;
    let _max = 0;
    form.main_section.forEach((main) => {
      main.sub_section.forEach((sub) => {
        sub.text_input.forEach((text) => {
          if (text.value && text.value.length > 0) _filled += 1;
          _max += 1;
        });
        sub.checkbox_group.forEach((group) => {
          let atLeastOneMain = 0;
          group.main_checkbox.forEach((m) => {
            if (m.checked) atLeastOneMain = 1;
          });
          _filled += atLeastOneMain;
          _max += 1;
        });
      });
    });
    const pct = _max === 0 ? 0 : Math.round((_filled / _max) * 100);
    return { progress: pct, completed: pct === 100, filled: _filled, max: _max };
  }, [form]);

  // --------------------
  // Presence indicator
  // --------------------
  const othersEditing = useMemo(() => {
    if (!teamMembers) return [] as IUserProfileResponse[];
    return teamMembers.filter((m) => isBeeingEdited.includes(m.user_id) && m.user_id !== userId);
  }, [teamMembers, isBeeingEdited, userId]);

  const youAreEditing = isBeeingEdited.includes(userId);
  const anyEditing = isBeeingEdited.length > 0;

  // --------------------
  // Actions
  // --------------------

  const handleExportPdf = async () => {
    if (!fillPDF) return;
    const { uri, error } = await fillPDF(form);
    if (error) Alert.alert('Export error', error);
    if (uri) {
      Alert.alert('PDF ready', `Saved to: ${uri}`);
      // Consider sharing with expo-sharing if you like
      // const canShare = await Sharing.isAvailableAsync();
      // if (canShare) await Sharing.shareAsync(uri);
    }
  };

  const confirmDelete = () => {
    if (setSelectedForm) setSelectedForm(form.id);
    if (setOpenAlertDialog) setOpenAlertDialog(true);
    else if (onDelete) onDelete(form.id);
  };

  // --------------------
  // Render
  // --------------------
  return (
    <Pressable
      onLongPress={() => setSheetOpen(true)}
      className={cn(
        'relative max-w-[400px] overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900',
        anyEditing ? 'border-blue-600' : ''
      )}
      accessibilityLabel="Form card"
      accessibilityHint="Long press to open actions">
      {/* Your editing badge */}
      {youAreEditing && (
        <View
          pointerEvents="box-none"
          className="absolute left-2 top-2 z-10 flex-row items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-white shadow">
          <Text className="text-xs font-medium">You’re working on this</Text>
        </View>
      )}

      {/* Others editing overlay */}
      {anyEditing && (
        <View pointerEvents="box-none" className="absolute right-2 top-2 z-10">
          <AvatarStack users={othersEditing} images={teamMemberProfilePictures} size={24} />
        </View>
      )}

      {/* Header */}
      <View className="flex-row items-start justify-between p-4">
        <View className="gap-1">
          <Text className="text-base font-semibold">ID: {form.identifier_string}</Text>
          <Text className="text-xs text-neutral-500">{form.form_type}</Text>
        </View>

        {/* HoverCard replacement: tap to open details */}
        <Pressable onPress={() => setProfileOpen(true)} className="rounded-xl p-2">
          {form.object_profile_icon && profileIcons[form.object_profile_icon as IconType]}
        </Pressable>
      </View>

      {/* Hover details modal */}
      <Modal
        transparent
        animationType="fade"
        visible={profileOpen}
        onRequestClose={() => setProfileOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setProfileOpen(false)}>
          <View className="mt-auto w-full px-4 pb-8">
            <View className="rounded-2xl bg-white p-4 dark:bg-neutral-900">
              <Text className="mb-2 text-lg font-semibold">
                {form.object_profile_name ?? 'Object'}
              </Text>
              {Object.entries(form.object_props).map(([k, v]) => (
                <View key={k} className="mb-1 flex-row items-center">
                  <Text className="w-28 text-sm text-neutral-500">{k}:</Text>
                  <Text className="flex-1 text-sm">{String(v)}</Text>
                </View>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Content */}
      <View className="px-4">
        <Text className="mb-2 text-xs text-neutral-500">Metadata:</Text>
        <View className="mb-3 h-44 w-full rounded-xl border-2 border-neutral-200 dark:border-neutral-800">
          <ScrollView contentContainerStyle={{ padding: 8 }}>
            {Object.entries(form.form_props).map(([k, v]) => (
              <View key={k} className="mb-2 flex-row items-center">
                <Text className="w-28 text-xs font-semibold">{k}:</Text>
                <Text className="flex-1 text-xs" numberOfLines={1} ellipsizeMode="tail">
                  {String(v)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <ProgressBar value={progress} />
        <Text className="mb-3 mt-1 text-xs text-neutral-500">
          Last updated:{' '}
          {format(new Date((form.updated_at as any) || form.created_at), 'MMM d, yyyy')}
        </Text>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between p-4 pt-2">
        {form.in_progress && completed ? (
          <Pressable className="rounded-full bg-green-600/90 px-3 py-2">
            <Text className="font-medium text-white">Completed</Text>
          </Pressable>
        ) : (
          <View />
        )}

        {form.in_progress ? (
          <Pressable
            hitSlop={6}
            onPress={() => {
              console.log(`/form/${form.id}`);
              router.push(`/form/${form.id}`);
            }}
            className="rounded-xl bg-blue-600 px-4 py-2"
            accessibilityRole="button"
            accessibilityLabel="Continue editing this form">
            <Text className="font-medium text-white">Continue</Text>
          </Pressable>
        ) : (
          <Pressable className="rounded-xl bg-blue-600 px-4 py-2">
            <Text className="font-medium text-white">Edit</Text>
          </Pressable>
        )}
      </View>

      {/* Context Menu Sheet (no full-card overlay anymore) */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetSection>
          <SheetItem
            onPress={() => {
              setSheetOpen(false);
              router.push(`/form-editor/${form.build_id}`);
            }}>
            <Settings2 size={18} />
            <Text className="ml-2 text-base">Visit build</Text>
          </SheetItem>
          <SheetItem
            onPress={() => {
              setSheetOpen(false);
              handleExportPdf();
            }}>
            <FileDown size={18} />
            <Text className="ml-2 text-base">Export to PDF</Text>
          </SheetItem>
          <SheetItem
            destructive
            onPress={() => {
              setSheetOpen(false);
              confirmDelete();
            }}>
            <Trash2 size={18} />
            <Text className="ml-2 text-base text-red-600">Delete</Text>
          </SheetItem>
        </SheetSection>
      </Sheet>
    </Pressable>
  );
}

// ============================================================================
// Local helpers (replace or move to your /components/ui/* as you like)
// ============================================================================

// ./_local/ProgressBar.tsx
export function ProgressBar({ value = 0 }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
      <View className="h-full bg-blue-600" style={{ width: `${clamped}%` }} />
    </View>
  );
}

// ./_local/Sheet.tsx — extremely small cross-platform action sheet using Modal
export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}>
      <Pressable className="flex-1 bg-black/40" onPress={() => onOpenChange(false)}>
        <View className="mt-auto w-full px-4 pb-8">
          <View className="overflow-hidden rounded-2xl bg-white dark:bg-neutral-900">
            {children}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

export function SheetSection({ children }: { children: React.ReactNode }) {
  return <View className="border-t border-neutral-200 dark:border-neutral-800">{children}</View>;
}

export function SheetItem({
  children,
  onPress,
  destructive,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-4">
      <View className="flex-row items-center">
        {/* children includes icon + label */}
        <View className={cn(destructive ? '' : '')}>{children}</View>
      </View>
    </Pressable>
  );
}

// ./_local/AvatarStack.tsx
export function AvatarStack({
  users,
  images,
  size = 24,
  title = 'Currently editing',
  onUserPress, // optional per-user tap inside the expanded list
}: {
  users: IUserProfileResponse[];
  images: Record<UUID, string | undefined>;
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
        {visible.map((u, idx) => (
          <View
            key={u.user_id}
            style={{ marginLeft: idx === 0 ? 0 : -size / 3 }}
            className="overflow-hidden rounded-full border border-white bg-white dark:border-neutral-900">
            {images[u.user_id] ? (
              <Image
                source={{ uri: images[u.user_id]! }}
                style={{ width: size, height: size, borderRadius: size / 2 }}
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
        ))}
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
              renderItem={({ item }) => (
                <Pressable
                  className="flex-row items-center gap-3 py-3"
                  onPress={() => {
                    onUserPress?.(item);
                    // keep open or close—your choice; comment next line to keep it open
                    setOpen(false);
                  }}>
                  <Avatar
                    uri={images[item.user_id]}
                    label={
                      (item.first_name ? `${item.first_name} ` : '') + (item.last_name ?? '') ||
                      item.email
                    }
                    size={32}
                  />
                  <View className="flex-1">
                    <Text className="text-base" numberOfLines={1}>
                      {displayName(item)}
                    </Text>
                    {!!item.email && (
                      <Text className="text-xs text-neutral-500" numberOfLines={1}>
                        {item.email}
                      </Text>
                    )}
                  </View>
                </Pressable>
              )}
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
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
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

// ./_local/cn.ts
export function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}
