"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { UUID } from "crypto";
import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

type FormMember = { user_id: string; user_name: string; tab_id: string };

type SectionEvent = {
  type: "main" | "sub";
  id: string;
  state: "open" | "closed";
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

interface UseFormRealtimeProps {
  formId: string | UUID;
  teamId?: string | UUID | null;
  user: { id: string; name: string };
  supabase: SupabaseClient<any, string, any>;

  onMainCheckboxUpdate: (
    id: UUID,
    checked: boolean,
    groupId: UUID,
    updatedBy: UUID
  ) => void;
  onSubCheckboxUpdate: (
    id: UUID,
    checked: boolean,
    mainCheckboxId: UUID,
    updatedBy: UUID
  ) => void;
  onTextInputUpdate: (
    id: UUID,
    value: string,
    subSectionId: UUID,
    updatedBy: UUID
  ) => void;

  channelDisconnected?: (state: boolean) => void;
  onPresenceChange?: (members: FormMember[]) => void;
  onUserColor?: (data: { user_id: string; color: string }) => void;
}

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
  const tabIdRef = useRef<string>(crypto.randomUUID());

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

  // ---------- per-form channel ----------
  const getOrCreateFormChannel = useCallback(() => {
    const existing = supabase.getChannels().find((c) => c.topic === formTopic);
    return (
      existing ??
      supabase.channel(formTopic, { config: { presence: { key: user.id } } })
    );
  }, [supabase, formTopic, user.id]);

  // ---------- team presence (minimal meta: { user_id, form_id, tab_id }) ----------
  const teamMetaRef = useRef<{
    user_id: string;
    form_id: string | null;
    tab_id: string;
  }>({
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
        if (!allowSubscribe) return; // never create/subscribe during cleanup
        ch = supabase.channel(teamTopic, {
          config: { presence: { key: user.id } },
        });
      }

      teamMetaRef.current.form_id = formIdOrNull ? String(formIdOrNull) : null;
      const send = () => ch!.track(teamMetaRef.current); // FULL object

      const state = (ch as any).state;
      if (state === "joined") send();
      else if (allowSubscribe) {
        ch.subscribe((status) => {
          if (!aliveRef.current) return;
          if (status === "SUBSCRIBED") send();
        });
      }
    },
    [getExistingTeamChannel, supabase, teamTopic, user.id]
  );

  // ---------- SECTION ACTIVITY TRACKING ----------
  // keep the most-recent section per (user_id:tab_id)
  const perTabSectionRef = useRef<Map<string, SectionEvent>>(new Map());
  // aggregated view per user for easy UI lookups (react state triggers re-render)
  const [sectionByUser, setSectionByUser] = useState<
    Record<string, SectionAggregate>
  >({});

  const recomputeSectionAggregate = useCallback(() => {
    // aggregate latest per user across tabs
    const byUser: Record<string, SectionAggregate> = {};
    for (const ev of perTabSectionRef.current.values()) {
      const { user_id, user_name } = ev.from;
      const prev = byUser[user_id] ?? {
        user_id,
        user_name,
        updatedAt: 0,
        main: null,
        sub: null,
      };
      if (ev.ts >= prev.updatedAt) {
        const next: SectionAggregate = { ...prev, updatedAt: ev.ts };
        if (ev.type === "main") next.main = ev.state === "open" ? ev.id : null;
        else next.sub = ev.state === "open" ? ev.id : null;
        byUser[user_id] = next;
      }
    }
    setSectionByUser(byUser);
  }, []);

  // prune per-tab entries for tabs that left (compare exact "user_id:tab_id")
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

  // helpers to query in UI
  const getUsersInSection = useCallback(
    (type: "main" | "sub", id: string) => {
      return Object.values(sectionByUser)
        .filter((a) => (type === "main" ? a.main === id : a.sub === id))
        .map((a) => a.user_id);
    },
    [sectionByUser]
  );

  const getUsersInMainOrSubs = useCallback(
    (mainId: string, subIds: string[]) => {
      const ids = new Set<string>();
      for (const a of Object.values(sectionByUser)) {
        if (a.main === mainId) ids.add(a.user_id);
        if (a.sub && subIds.includes(a.sub)) ids.add(a.user_id);
      }
      return Array.from(ids);
    },
    [sectionByUser]
  );

  // ---------- broadcasts helpers ----------
  const sendBroadcast = useCallback((event: string, payload: unknown) => {
    channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  const sendUserColor = useCallback(
    (color: string) => {
      const payload = { user_id: user.id, color };
      channelRef.current?.send({
        type: "broadcast",
        event: "user_color",
        payload,
      });
    },
    [user.id]
  );

  const sendCursor = useCallback(
    (cursor: { x: number; y: number }) => {
      sendBroadcast("cursor", cursor);
    },
    [sendBroadcast]
  );

  const sendLock = useCallback(
    (lock: { fieldId: string; locked: boolean }) => {
      sendBroadcast("lock", lock);
    },
    [sendBroadcast]
  );

  const sendSection = useCallback(
    (section: {
      type: "main" | "sub";
      id: string;
      state: "open" | "closed";
    }) => {
      const payload: SectionEvent = {
        ...section,
        from: {
          user_id: user.id,
          user_name: user.name,
          tab_id: tabIdRef.current,
        },
        ts: Date.now(),
      };
      sendBroadcast("section", payload);
      // optimistic update
      const key = `${payload.from.user_id}:${payload.from.tab_id}`;
      perTabSectionRef.current.set(key, payload);
      recomputeSectionAggregate();
    },
    [sendBroadcast, user.id, user.name, recomputeSectionAggregate]
  );

  // NEW: one-shot reset so peers clear our tab’s sections immediately
  const sendSectionReset = useCallback(() => {
    const payload = {
      from: { user_id: user.id, tab_id: tabIdRef.current },
      ts: Date.now(),
    };
    channelRef.current?.send({
      type: "broadcast",
      event: "section_reset",
      payload,
    });
  }, [user.id]);

  // ---------- effect: wire everything ----------
  useEffect(() => {
    aliveRef.current = true;
    if (!formIdStr) return;

    const channel = getOrCreateFormChannel();

    // If already joined, don't rewire—just ensure team presence and return
    if ((channel as any).state === "joined") {
      channelRef.current = channel;
      discRef.current?.(false);
      writeTeamPresence(formIdStr, { allowSubscribe: true });
      return;
    }

    // In-form presence
    channel.on("presence", { event: "sync" }, () => {
      if (!aliveRef.current) return;
      const state = channel.presenceState<FormMember>();
      setMembers(Object.values(state).flat());

      // Build set of present (user_id:tab_id) combos and prune
      const presentKeys = new Set<string>();
      for (const [user_id, metas] of Object.entries(state)) {
        for (const m of metas) presentKeys.add(`${user_id}:${m.tab_id}`);
      }
      pruneSectionsAgainstPresence(presentKeys);
    });

    // Optional broadcasts
    channel.on("broadcast", { event: "cursor" }, () => {});
    channel.on("broadcast", { event: "lock" }, () => {});

    // Section activity receiver
    channel.on("broadcast", { event: "section" }, ({ payload }) => {
      if (!aliveRef.current) return;
      const p = payload as SectionEvent;
      if (!p?.from?.user_id || !p?.from?.tab_id || !p.type || !p.id || !p.state)
        return;
      const key = `${p.from.user_id}:${p.from.tab_id}`;
      perTabSectionRef.current.set(key, p);
      recomputeSectionAggregate();
    });

    // Color change receiver
    channel.on("broadcast", { event: "user_color" }, ({ payload }) => {
      if (!aliveRef.current) return;
      const data = payload as { user_id: string; color: string };
      userColorRef.current?.(data);
    });

    // NEW: section_reset receiver
    channel.on("broadcast", { event: "section_reset" }, ({ payload }) => {
      if (!aliveRef.current) return;
      const p = payload as {
        from: { user_id: string; tab_id: string };
        ts: number;
      };
      if (!p?.from?.user_id || !p?.from?.tab_id) return;
      perTabSectionRef.current.delete(`${p.from.user_id}:${p.from.tab_id}`);
      recomputeSectionAggregate();
    });

    // Postgres changes
    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "form_filler",
          table: "main_checkbox",
          filter: `form_id=eq.${formIdStr}`,
        },
        ({ new: n }: any) => {
          if (n) mainCbRef.current?.(n.id, n.checked, n.group_id, n.updated_by);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "form_filler",
          table: "sub_checkbox",
          filter: `form_id=eq.${formIdStr}`,
        },
        ({ new: n }: any) => {
          if (n)
            subCbRef.current?.(
              n.id,
              n.checked,
              n.main_checkbox_id,
              n.updated_by
            );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "form_filler",
          table: "text_input",
          filter: `form_id=eq.${formIdStr}`,
        },
        ({ new: n }: any) => {
          if (n)
            textCbRef.current?.(n.id, n.value, n.sub_section_id, n.updated_by);
        }
      );

    channel.subscribe(async (status) => {
      if (!aliveRef.current) return;

      if (status === "SUBSCRIBED") {
        discRef.current?.(false);
        await channel.track({
          user_id: user.id,
          user_name: user.name,
          tab_id: tabIdRef.current,
        } as FormMember);
        writeTeamPresence(formIdStr, { allowSubscribe: true });
      } else if (
        status === "TIMED_OUT" ||
        status === "CLOSED" ||
        status === "CHANNEL_ERROR"
      ) {
        discRef.current?.(true);
      }
    });

    channelRef.current = channel;

    // Best-effort: on tab close, broadcast reset
    const onUnload = () => {
      try {
        sendSectionReset();
      } catch {}
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      aliveRef.current = false;

      // reset sections immediately for peers
      sendSectionReset();

      // set team form_id to null (only if channel already exists)
      writeTeamPresence(null, { allowSubscribe: false });

      try {
        channel.untrack();
      } catch {}
      supabase.removeChannel(channel);
      channelRef.current = null;
      setMembers([]);
      perTabSectionRef.current.clear();
      setSectionByUser({});

      window.removeEventListener("beforeunload", onUnload);
    };
  }, [
    formIdStr,
    user.id,
    user.name,
    getOrCreateFormChannel,
    writeTeamPresence,
    pruneSectionsAgainstPresence,
    sendSectionReset,
    supabase,
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
    getUsersInSection,
    getUsersInMainOrSubs,

    // user color
    sendUserColor,
  };
}
