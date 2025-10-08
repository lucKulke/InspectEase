"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { UUID } from "crypto";
import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

type FormMember = { user_id: string; user_name: string; tab_id: string };

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
  // keep last meta so we always send a FULL object (track doesn't accept a function)
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
      if (state === "joined") {
        send();
      } else if (allowSubscribe) {
        ch.subscribe((status) => {
          if (!aliveRef.current) return;
          if (status === "SUBSCRIBED") send();
        });
      }
    },
    [getExistingTeamChannel, supabase, teamTopic, user.id]
  );

  // ---------- broadcasts helpers ----------
  const sendBroadcast = useCallback((event: string, payload: unknown) => {
    channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

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
    });

    // Optional broadcasts
    channel.on("broadcast", { event: "cursor" }, () => {});
    channel.on("broadcast", { event: "lock" }, () => {});

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
        // in-form presence payload (can include name for the editor UI)
        await channel.track({
          user_id: user.id,
          user_name: user.name,
          tab_id: tabIdRef.current,
        } as FormMember);

        // tell the TEAM presence which form this user is in (allowed to subscribe on mount)
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

    return () => {
      // On leave: set team form_id to null, but NEVER create/subscribe here
      aliveRef.current = false;
      writeTeamPresence(null, { allowSubscribe: false });

      try {
        channel.untrack();
      } catch {}
      supabase.removeChannel(channel);
      channelRef.current = null;
      setMembers([]);
    };
  }, [
    formIdStr,
    user.id,
    user.name,
    getOrCreateFormChannel,
    writeTeamPresence,
    supabase,
  ]);

  const memberNames = useMemo(() => members.map((m) => m.user_name), [members]);

  return { members, memberNames, sendBroadcast, sendCursor, sendLock };
}
