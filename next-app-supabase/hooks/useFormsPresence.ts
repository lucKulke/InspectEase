// hooks/useFormsPresence.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { UUID } from "crypto";

/** Use your existing singleton if you have one */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PresenceMeta = {
  userId: string;
  name: string;
  formId: string;
  lastActive?: string;
};
type PresenceState = Record<string, Array<PresenceMeta>>;

export interface DashboardActiveForm {
  formId: string;
  activeUsers: number;
  lastActive: number; // epoch ms
  users: string[];
}

function computeDashboard(state: PresenceState): DashboardActiveForm[] {
  const metas: PresenceMeta[] = Object.values(state).flatMap((arr) => arr);
  const byForm = new Map<string, { users: Set<string>; lastActive: number }>();

  for (const m of metas) {
    if (!m.formId) continue;
    const last = m.lastActive ? Date.parse(m.lastActive) : 0;
    const entry = byForm.get(m.formId) ?? { users: new Set(), lastActive: 0 };
    entry.users.add(m.name || m.userId);
    if (!Number.isNaN(last) && last > entry.lastActive) entry.lastActive = last;
    byForm.set(m.formId, entry);
  }

  return [...byForm.entries()].map(([formId, v]) => ({
    formId,
    activeUsers: v.users.size,
    lastActive: v.lastActive,
    users: [...v.users].sort(),
  }));
}

export function useFormsPresence({
  teamId,
}: {
  teamId: UUID | null;
}): DashboardActiveForm[] {
  const [roster, setRoster] = useState<PresenceState>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!teamId) return;

    // If teamId changes, tear down the old channel first
    if (channelRef.current) {
      channelRef.current.unsubscribe().catch(() => {});
      channelRef.current = null;
    }

    // Give the dashboard a stable presence key (we won't call track())
    const observerKey =
      (typeof window !== "undefined" &&
        (sessionStorage.getItem("dashboard-presence-key") ||
          (sessionStorage.setItem(
            "dashboard-presence-key",
            crypto.randomUUID()
          ),
          sessionStorage.getItem("dashboard-presence-key")))) ||
      "dashboard";

    const channel = supabase.channel(`team:${teamId}:forms`, {
      config: { presence: { key: `dashboard:${observerKey}` } },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        setRoster(channel.presenceState() as PresenceState);
      })
      .on("presence", { event: "join" }, () => {
        setRoster(channel.presenceState() as PresenceState);
      })
      .on("presence", { event: "leave" }, () => {
        setRoster(channel.presenceState() as PresenceState);
      });

    channel.subscribe();

    return () => {
      channel.unsubscribe().catch(() => {});
      channelRef.current = null;
    };
  }, [teamId]);

  const dashboard = useMemo(() => computeDashboard(roster), [roster]);
  return dashboard;
}
