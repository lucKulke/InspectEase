// hooks/useTeamPresence.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

type PresenceMeta = {
  user_id: string;
  form_id: string | null;
  tab_id: string;
};

export function useTeamPresence(
  teamId: string | null,
  userId: string,
  supabase: SupabaseClient<any, string, any>
) {
  const topic = teamId ? `presence:team_${teamId}` : null;

  const [state, setState] = useState<Record<string, PresenceMeta[]>>({});
  const tabIdRef = useRef<string>(
    typeof crypto !== "undefined"
      ? crypto.randomUUID()
      : Math.random().toString(36)
  );
  const channelRef = useRef<RealtimeChannel | null>(null);
  const createdHereRef = useRef(false);
  const wiredRef = useRef(false);
  const aliveRef = useRef(true);

  // keep last meta so we always send a FULL object (track doesn't accept a function)
  const selfMetaRef = useRef<PresenceMeta>({
    user_id: userId,
    form_id: null,
    tab_id: tabIdRef.current,
  });

  const getOrCreateChannel = useCallback(() => {
    if (!topic) return null;
    const existing = supabase.getChannels().find((c) => c.topic === topic);
    if (existing) {
      createdHereRef.current = false;
      return existing;
    }
    createdHereRef.current = true;
    return supabase.channel(topic, { config: { presence: { key: userId } } });
  }, [supabase, topic, userId]);

  // 🔧 make an immutable snapshot so React sees a new reference
  const snapshotPresence = useCallback((): Record<string, PresenceMeta[]> => {
    const ch = channelRef.current!;
    const raw = ch.presenceState<PresenceMeta>();
    const copy: Record<string, PresenceMeta[]> = {};
    for (const [uid, metas] of Object.entries(raw)) {
      copy[uid] = metas.map((m) => ({
        user_id: m.user_id,
        form_id: m.form_id ?? null,
        tab_id: m.tab_id,
      }));
    }
    return copy;
  }, []);

  const pushPresence = useCallback(() => {
    const ch = channelRef.current;
    if (!ch) return;
    ch.track(selfMetaRef.current); // full object
  }, []);

  // Expose setter (optional to use elsewhere)
  const setCurrentForm = useCallback(
    (formId: string | null) => {
      selfMetaRef.current.form_id = formId ? String(formId) : null;
      pushPresence();
    },
    [pushPresence]
  );

  useEffect(() => {
    aliveRef.current = true;
    if (!topic) return;

    const ch = getOrCreateChannel();
    if (!ch) return;
    channelRef.current = ch;

    if (!wiredRef.current) {
      const update = () => {
        if (!aliveRef.current) return;
        setState(snapshotPresence()); // <-- new object every event
      };
      ch.on("presence", { event: "sync" }, update)
        .on("presence", { event: "join" }, update)
        .on("presence", { event: "leave" }, update);
      wiredRef.current = true;
    }

    if ((ch as any).state !== "joined") {
      ch.subscribe((status) => {
        if (!aliveRef.current) return;
        if (status === "SUBSCRIBED") {
          pushPresence(); // initial idle
          setState(snapshotPresence());
        }
      });
    } else {
      pushPresence();
      setState(snapshotPresence());
    }

    const onUnload = () => ch.untrack();
    window.addEventListener("beforeunload", onUnload);

    return () => {
      aliveRef.current = false;
      window.removeEventListener("beforeunload", onUnload);
      try {
        ch.untrack();
      } catch {}
      if (createdHereRef.current) supabase.removeChannel(ch);
      channelRef.current = null;
      wiredRef.current = false;
      setState({});
    };
  }, [getOrCreateChannel, pushPresence, snapshotPresence, supabase, topic]);

  // Ready-to-use map: formId -> [userIds]
  const byForm = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const metas of Object.values(state)) {
      for (const m of metas) {
        const key = m.form_id ?? "_idle";
        const arr = map.get(key) ?? [];
        if (!arr.includes(m.user_id)) arr.push(m.user_id); // de-dupe tabs
        map.set(key, arr);
      }
    }
    return map;
  }, [state]);

  // Optional flat view
  const members = useMemo(() => Object.values(state).flat(), [state]);

  return { byForm, members, setCurrentForm };
}
