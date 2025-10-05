// hooks/useFormEditorPresence.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type EditorMeta = {
  userId: string;
  name: string;
  formId: string;
  lastActive: string; // ISO
};

type PresenceState = Record<string, Array<EditorMeta>>;

function getClientId() {
  const k = "forms-presence-client-id";
  let id = sessionStorage.getItem(k);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(k, id);
  }
  return id;
}

export function useFormEditorPresence(params: {
  teamId: string | null;
  formId: string | null;
  user: { id: string; name: string } | null;
}) {
  const { teamId, formId, user } = params;
  const [roster, setRoster] = useState<PresenceState>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const clientKeyRef = useRef<string>("");

  useEffect(() => {
    if (!teamId || !formId || !user?.id) return;

    // teardown old channel if any
    if (channelRef.current) {
      channelRef.current.unsubscribe().catch(() => {});
      channelRef.current = null;
    }

    const clientKey = `${user.id}:${getClientId()}`;
    clientKeyRef.current = clientKey;

    const channel = supabase.channel(`team:${teamId}:forms`, {
      config: { presence: { key: clientKey } },
    });
    channelRef.current = channel;

    const trackNow = async () => {
      const meta: EditorMeta = {
        userId: user.id,
        name: user.name,
        formId,
        lastActive: new Date().toISOString(),
      };
      // track() upserts our meta under this presence key
      await channel.track(meta).catch(() => {});
    };

    let interval: any;

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

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await trackNow();
        interval = setInterval(trackNow, 20_000); // heartbeat
      }
    });

    // keep lastActive fresh on tab hide/show
    const onVis = () =>
      document.visibilityState === "hidden" ? void trackNow() : void trackNow();
    document.addEventListener("visibilitychange", onVis);

    // best-effort untrack on unload
    const onUnload = () => {
      void channel.untrack();
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("beforeunload", onUnload);
      // untrack + unsubscribe
      channel.untrack().catch(() => {});
      channel.unsubscribe().catch(() => {});
      channelRef.current = null;
    };
  }, [teamId, formId, user?.id, user?.name]);

  // who else is editing THIS form (exclude my own presence key)
  const others = useMemo(() => {
    const meKey = clientKeyRef.current;
    const all = Object.entries(roster).flatMap(([key, metas]) =>
      key === meKey ? [] : metas
    );
    return all.filter((m) => m.formId === formId);
  }, [roster, formId]);

  // optionally expose my presence too (useful for debug/UI)
  const me = useMemo(() => {
    const meKey = clientKeyRef.current;
    const arr = roster[meKey] || [];
    return arr.find((m) => m.formId === formId);
  }, [roster, formId]);

  return { others, me };
}
