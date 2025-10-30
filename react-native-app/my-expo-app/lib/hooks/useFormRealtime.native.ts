// hooks/useFormRealtime.native.ts
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { AppState, AppStateStatus } from 'react-native';

// ----------------- Types -----------------
type UUID = string;
type FormMember = { user_id: string; user_name: string; tab_id: string };

type SectionEvent = {
  type: 'main' | 'sub';
  id: string;
  state: 'open' | 'closed';
  from: { user_id: string; user_name: string; tab_id: string };
  ts: number;
};

type SectionAggregate = {
  user_id: string;
  user_name: string;
  updatedAt: number;
  main?: string | null;
  sub?: string | null;
};

type ChannelStatus =
  | 'idle' // not created yet
  | 'joining' // created, waiting for SUBSCRIBED
  | 'subscribed' // live
  | 'timed_out' // network hiccup
  | 'closed' // intentionally closed or socket down
  | 'error'; // CHANNEL_ERROR or similar

interface UseFormRealtimeProps {
  formId: string | UUID;
  teamId?: string | UUID | null;
  user: { id: string; name: string };
  supabase: SupabaseClient<any, string, any>;

  onMainCheckboxUpdate: (id: UUID, checked: boolean, groupId: UUID, updatedBy: UUID) => void;
  onSubCheckboxUpdate: (id: UUID, checked: boolean, mainCheckboxId: UUID, updatedBy: UUID) => void;
  onTextInputUpdate: (id: UUID, value: string, subSectionId: UUID, updatedBy: UUID) => void;

  channelDisconnected?: (state: boolean) => void;
  onPresenceChange?: (members: FormMember[]) => void;
  onUserColor?: (data: { user_id: string; color: string }) => void;
}

// ----------------- Helpers -----------------
const genTabId = () => {
  try {
    const id = globalThis?.crypto?.randomUUID?.();
    if (id) return id;
  } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

// ===================================================================
// React Native version of your form realtime hook
// ===================================================================
export function useFormRealtime({
  formId,
  teamId,
  user,
  supabase,
  onMainCheckboxUpdate,
  onSubCheckboxUpdate,
  onTextInputUpdate,
  channelDisconnected,
  onPresenceChange,
  onUserColor,
}: UseFormRealtimeProps) {
  // ---------- refs & stable handlers ----------
  const channelRef = useRef<RealtimeChannel | null>(null);
  const aliveRef = useRef<boolean>(true);
  const tabIdRef = useRef<string>(genTabId());

  const mainCbRef = useRef(onMainCheckboxUpdate);
  const subCbRef = useRef(onSubCheckboxUpdate);
  const textCbRef = useRef(onTextInputUpdate);
  const discRef = useRef(channelDisconnected);
  const presenceRef = useRef(onPresenceChange);
  const userColorRef = useRef(onUserColor);

  useEffect(() => {
    userColorRef.current = onUserColor;
  }, [onUserColor]);
  useEffect(() => {
    mainCbRef.current = onMainCheckboxUpdate;
  }, [onMainCheckboxUpdate]);
  useEffect(() => {
    subCbRef.current = onSubCheckboxUpdate;
  }, [onSubCheckboxUpdate]);
  useEffect(() => {
    textCbRef.current = onTextInputUpdate;
  }, [onTextInputUpdate]);
  useEffect(() => {
    discRef.current = channelDisconnected;
  }, [channelDisconnected]);
  useEffect(() => {
    presenceRef.current = onPresenceChange;
  }, [onPresenceChange]);

  // ---------- local in-form presence (optional UI) ----------
  const [members, setMembers] = useState<FormMember[]>([]);
  useEffect(() => {
    presenceRef.current?.(members);
  }, [members]);

  const formIdStr = String(formId);
  const formTopic = `form:${formIdStr}`;
  const teamTopic = teamId ? `presence:team_${String(teamId)}` : null;

  // ---------- channel status machine ----------
  const [channelStatus, setChannelStatus] = useState<ChannelStatus>('idle');
  const isChannelHealthy = channelStatus === 'subscribed';

  const getChannelStatus = useCallback<() => ChannelStatus>(() => {
    const raw = (channelRef.current as any)?.state as string | undefined; // 'closed' | 'errored' | 'joining' | 'joined' | ...
    if (channelStatus !== 'idle') return channelStatus;
    if (raw === 'joined') return 'subscribed';
    if (raw === 'joining') return 'joining';
    if (raw === 'closed') return 'closed';
    if (raw === 'errored') return 'error';
    return 'idle';
  }, [channelStatus]);

  // ---------- per-form channel ----------
  const getOrCreateFormChannel = useCallback(() => {
    const existing = supabase.getChannels().find((c) => c.topic === formTopic);
    return existing ?? supabase.channel(formTopic, { config: { presence: { key: user.id } } });
  }, [supabase, formTopic, user.id]);

  // ---------- team presence meta ----------
  const teamMetaRef = useRef<{ user_id: string; form_id: string | null; tab_id: string }>({
    user_id: user.id,
    form_id: null,
    tab_id: tabIdRef.current,
  });

  const getExistingTeamChannel = useCallback(() => {
    if (!teamTopic) return null;
    return supabase.getChannels().find((c) => c.topic === teamTopic) ?? null;
  }, [supabase, teamTopic]);

  const writeTeamPresence = useCallback(
    (formIdOrNull: string | null, opts: { allowSubscribe?: boolean } = {}) => {
      const { allowSubscribe = false } = opts;
      if (!teamTopic) return;

      let ch = getExistingTeamChannel();
      if (!ch) {
        if (!allowSubscribe) return;
        ch = supabase.channel(teamTopic, { config: { presence: { key: user.id } } });
      }

      teamMetaRef.current.form_id = formIdOrNull ? String(formIdOrNull) : null;
      const send = () => ch!.track(teamMetaRef.current);

      const state = (ch as any).state;
      if (state === 'joined') send();
      else if (allowSubscribe) {
        ch.subscribe((status) => {
          if (!aliveRef.current) return;
          if (status === 'SUBSCRIBED') send();
        });
      }
    },
    [getExistingTeamChannel, supabase, teamTopic, user.id]
  );

  // ---------- SECTION ACTIVITY TRACKING ----------
  const perTabSectionRef = useRef<Map<string, SectionEvent>>(new Map());
  const [sectionByUser, setSectionByUser] = useState<Record<string, SectionAggregate>>({});

  const recomputeSectionAggregate = useCallback(() => {
    const byUser: Record<string, SectionAggregate> = {};
    for (const ev of perTabSectionRef.current.values()) {
      const { user_id, user_name } = ev.from;
      const prev = byUser[user_id] ?? { user_id, user_name, updatedAt: 0, main: null, sub: null };
      if (ev.ts >= prev.updatedAt) {
        const next: SectionAggregate = { ...prev, updatedAt: ev.ts };
        if (ev.type === 'main') next.main = ev.state === 'open' ? ev.id : null;
        else next.sub = ev.state === 'open' ? ev.id : null;
        byUser[user_id] = next;
      }
    }
    setSectionByUser(byUser);
  }, []);

  const pruneSectionsAgainstPresence = useCallback(
    (presentKeys: Set<string>) => {
      let changed = false;
      for (const key of Array.from(perTabSectionRef.current.keys())) {
        if (!presentKeys.has(key)) {
          perTabSectionRef.current.delete(key);
          changed = true;
        }
      }
      if (changed) recomputeSectionAggregate();
    },
    [recomputeSectionAggregate]
  );

  // ---------- broadcasts helpers ----------
  const sendBroadcast = useCallback((event: string, payload: unknown) => {
    channelRef.current?.send({ type: 'broadcast', event, payload });
  }, []);

  const sendUserColor = useCallback(
    (color: string) => {
      const payload = { user_id: user.id, color };
      channelRef.current?.send({ type: 'broadcast', event: 'user_color', payload });
    },
    [user.id]
  );

  const sendCursor = useCallback(
    (cursor: { x: number; y: number }) => {
      sendBroadcast('cursor', cursor);
    },
    [sendBroadcast]
  );

  const sendLock = useCallback(
    (lock: { fieldId: string; locked: boolean }) => {
      sendBroadcast('lock', lock);
    },
    [sendBroadcast]
  );

  const sendSection = useCallback(
    (section: { type: 'main' | 'sub'; id: string; state: 'open' | 'closed' }) => {
      const payload: SectionEvent = {
        ...section,
        from: { user_id: user.id, user_name: user.name, tab_id: tabIdRef.current },
        ts: Date.now(),
      };
      sendBroadcast('section', payload);
      // optimistic
      const key = `${payload.from.user_id}:${payload.from.tab_id}`;
      perTabSectionRef.current.set(key, payload);
      recomputeSectionAggregate();
    },
    [sendBroadcast, user.id, user.name, recomputeSectionAggregate]
  );

  const sendSectionReset = useCallback(() => {
    const payload = { from: { user_id: user.id, tab_id: tabIdRef.current }, ts: Date.now() };
    channelRef.current?.send({ type: 'broadcast', event: 'section_reset', payload });
  }, [user.id]);

  // ---------- reusable binder (initial + reconnect) ----------
  const bindChannel = useCallback(
    (channel: RealtimeChannel) => {
      channel
        .on('presence', { event: 'sync' }, () => {
          if (!aliveRef.current) return;
          const state = channel.presenceState<FormMember>();
          setMembers(Object.values(state).flat());

          const presentKeys = new Set<string>();
          for (const [user_id, metas] of Object.entries(state)) {
            for (const m of metas) presentKeys.add(`${user_id}:${m.tab_id}`);
          }
          pruneSectionsAgainstPresence(presentKeys);
        })
        .on('broadcast', { event: 'cursor' }, () => {})
        .on('broadcast', { event: 'lock' }, () => {})
        .on('broadcast', { event: 'section' }, ({ payload }) => {
          if (!aliveRef.current) return;
          const p = payload as SectionEvent;
          if (!p?.from?.user_id || !p?.from?.tab_id || !p.type || !p.id || !p.state) return;
          const key = `${p.from.user_id}:${p.from.tab_id}`;
          perTabSectionRef.current.set(key, p);
          recomputeSectionAggregate();
        })
        .on('broadcast', { event: 'user_color' }, ({ payload }) => {
          if (!aliveRef.current) return;
          const data = payload as { user_id: string; color: string };
          userColorRef.current?.(data);
        })
        .on('broadcast', { event: 'section_reset' }, ({ payload }) => {
          if (!aliveRef.current) return;
          const p = payload as { from: { user_id: string; tab_id: string }; ts: number };
          if (!p?.from?.user_id || !p?.from?.tab_id) return;
          perTabSectionRef.current.delete(`${p.from.user_id}:${p.from.tab_id}`);
          recomputeSectionAggregate();
        })
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'form_filler',
            table: 'main_checkbox',
            filter: `form_id=eq.${formIdStr}`,
          },
          ({ new: n }: any) => {
            if (n) mainCbRef.current?.(n.id, n.checked, n.group_id, n.updated_by);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'form_filler',
            table: 'sub_checkbox',
            filter: `form_id=eq.${formIdStr}`,
          },
          ({ new: n }: any) => {
            if (n) subCbRef.current?.(n.id, n.checked, n.main_checkbox_id, n.updated_by);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'form_filler',
            table: 'text_input',
            filter: `form_id=eq.${formIdStr}`,
          },
          ({ new: n }: any) => {
            if (n) textCbRef.current?.(n.id, n.value, n.sub_section_id, n.updated_by);
          }
        );

      channel.subscribe(async (status) => {
        if (!aliveRef.current) return;

        if (status === 'SUBSCRIBED') {
          setChannelStatus('subscribed');
          discRef.current?.(false);
          try {
            await channel.track({
              user_id: user.id,
              user_name: user.name,
              tab_id: tabIdRef.current,
            } as FormMember);
          } catch {}
          writeTeamPresence(formIdStr, { allowSubscribe: true });
        } else if (status === 'TIMED_OUT') {
          setChannelStatus('timed_out');
          discRef.current?.(true);
        } else if (status === 'CLOSED') {
          setChannelStatus('closed');
          discRef.current?.(true);
        } else if (status === 'CHANNEL_ERROR') {
          setChannelStatus('error');
          discRef.current?.(true);
        }
      });

      channelRef.current = channel;
    },
    [
      formIdStr,
      user.id,
      user.name,
      pruneSectionsAgainstPresence,
      recomputeSectionAggregate,
      writeTeamPresence,
    ]
  );

  // ---------- reconnect helper ----------
  const tryReconnect = useCallback(() => {
    if (!aliveRef.current) return;

    const doIt = async () => {
      const current = channelRef.current;
      if ((current as any)?.state === 'joined') return; // already fine

      // remove only this channel to avoid dupes
      if (current) {
        try {
          await supabase.removeChannel(current);
        } catch {}
        channelRef.current = null;
      }

      // ensure socket is up (no-op if already)
      try {
        (supabase.realtime as any)?.connect?.();
      } catch {}

      setChannelStatus('joining');
      const fresh = supabase.channel(formTopic, { config: { presence: { key: user.id } } });
      bindChannel(fresh);
    };

    doIt();
  }, [bindChannel, formTopic, supabase, user.id]);

  // ---------- RN lifecycle: track/untrack on app foreground/background ----------
  useEffect(() => {
    const onAppState = (next: AppStateStatus) => {
      const ch = channelRef.current;
      if (!ch) {
        if (next === 'active') tryReconnect();
        return;
      }
      if (next === 'active') {
        // On resume: re-track presence (form + team) and heal if needed
        if ((ch as any).state !== 'joined') tryReconnect();
        try {
          ch.track({
            user_id: user.id,
            user_name: user.name,
            tab_id: tabIdRef.current,
          } as FormMember);
        } catch {}
        writeTeamPresence(formIdStr, { allowSubscribe: true });
      } else if (next === 'background' || next === 'inactive') {
        // On background: cleanly untrack and reset sections for this tab
        try {
          sendSectionReset();
        } catch {}
        try {
          ch.untrack();
        } catch {}
        writeTeamPresence(null, { allowSubscribe: false });
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [formIdStr, sendSectionReset, tryReconnect, user.id, user.name, writeTeamPresence]);

  // ---------- wire everything ----------
  useEffect(() => {
    aliveRef.current = true;
    if (!formIdStr) return;

    const channel = getOrCreateFormChannel();
    setChannelStatus((channel as any).state === 'joined' ? 'subscribed' : 'joining');

    if ((channel as any).state === 'joined') {
      channelRef.current = channel;
      discRef.current?.(false);
      writeTeamPresence(formIdStr, { allowSubscribe: true });
    } else {
      bindChannel(channel);
    }

    const disconnectCompletely = async () => {
      try {
        await channelRef.current?.unsubscribe();
        await channel.unsubscribe();
        // Prefer removing just this channel; only use removeAllChannels if you really intend it.
        await supabase.removeAllChannels();
        (supabase.realtime as any)?.disconnect?.();
        channelRef.current = null;
        perTabSectionRef.current.clear();
      } catch {
        // swallow
      }
    };

    return () => {
      aliveRef.current = false;
      // Tell peers to clear this tab’s section markers and clear team form
      try {
        sendSectionReset();
      } catch {}
      writeTeamPresence(null, { allowSubscribe: false });
      if (channelRef.current?.state === 'joined') {
        try {
          disconnectCompletely();
        } catch {}
        return;
      }

      try {
        channel.untrack();
      } catch {}
      try {
        supabase.removeChannel(channel);
      } catch {}
      channelRef.current = null;

      setMembers([]);
      perTabSectionRef.current.clear();
      setSectionByUser({});
      setChannelStatus('closed');
    };
  }, [
    formIdStr,
    getOrCreateFormChannel,
    bindChannel,
    sendSectionReset,
    supabase,
    writeTeamPresence,
  ]);

  const memberNames = useMemo(() => members.map((m) => m.user_name), [members]);

  return {
    members,
    memberNames,

    // collaboration helpers
    sendBroadcast,
    sendCursor,
    sendLock,

    // sections
    sendSection,
    sectionByUser, // { [user_id]: { main?, sub?, user_name, updatedAt } }
    getUsersInSection: useCallback(
      (type: 'main' | 'sub', id: string) =>
        Object.values(sectionByUser)
          .filter((a) => (type === 'main' ? a.main === id : a.sub === id))
          .map((a) => a.user_id),
      [sectionByUser]
    ),
    getUsersInMainOrSubs: useCallback(
      (mainId: string, subIds: string[]) => {
        const ids = new Set<string>();
        for (const a of Object.values(sectionByUser)) {
          if (a.main === mainId) ids.add(a.user_id);
          if (a.sub && subIds.includes(a.sub)) ids.add(a.user_id);
        }
        return Array.from(ids);
      },
      [sectionByUser]
    ),

    // user color
    sendUserColor,

    // NEW: channel status + helpers
    channelStatus,
    isChannelHealthy,
    getChannelStatus,

    // optional: manual heal trigger
    tryReconnect,
  };
}
