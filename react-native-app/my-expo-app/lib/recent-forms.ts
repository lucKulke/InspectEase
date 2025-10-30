// lib/recent-forms.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecentForm = {
  id: string;
  code?: string | null; // identifier_string
  name?: string | null; // optional title
  visitedAt: number; // epoch ms
};

const KEY = 'recent_forms:v1';
const MAX_ITEMS = 8;

export async function loadRecentForms(): Promise<RecentForm[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as RecentForm[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function saveRecentForm(entry: Omit<RecentForm, 'visitedAt'>) {
  const now = Date.now();
  const current = await loadRecentForms();

  // dedupe by id
  const without = current.filter((x) => x.id !== entry.id);
  const next: RecentForm[] = [{ ...entry, visitedAt: now }, ...without].slice(0, MAX_ITEMS);

  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function clearRecentForms() {
  await AsyncStorage.removeItem(KEY);
}
