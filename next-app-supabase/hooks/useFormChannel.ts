// hooks/useFormChannel.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

type FormPresenceMeta = {
  user_id: string;
  user_name: string;
  tab_id: string;
};

export function useFormChannel(
  supabase: SupabaseClient<any, string, any>,
  formId: string,
  user: { id: string; name: string }
) {
  const tabIdRef = useRef(crypto.randomUUID());
  const [formMembers, setFormMembers] = useState<FormPresenceMeta[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`form:${formId}`, {
      config: { presence: { key: user.id } },
    });

    // Presence in the form channel (optional but nice for UI inside the form)
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<FormPresenceMeta>();
      setFormMembers(Object.values(state).flat());
    });

    // Broadcast handlers (typing, cursor, field lock, etc.)
    channel.on("broadcast", { event: "cursor" }, ({ payload }) => {
      // handle other users' cursors
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: user.id,
          user_name: user.name,
          tab_id: tabIdRef.current,
        } as FormPresenceMeta);

        // also reflect “I’m in this form” on the team presence channel
        const teamChannel = supabase
          .getChannels()
          .find((c) => c.topic.startsWith("presence:team_"));
        teamChannel?.track((prev: any) => ({
          ...(typeof prev === "object" ? prev : {}),
          current_form_id: formId,
          updated_at: Date.now(),
        }));
      }
    });

    const onUnload = () => {
      // set back to null on the team presence (best effort)
      const teamChannel = supabase
        .getChannels()
        .find((c) => c.topic.startsWith("presence:team_"));
      teamChannel?.track((prev: any) => ({
        ...(typeof prev === "object" ? prev : {}),
        current_form_id: null,
        updated_at: Date.now(),
      }));
      channel.untrack();
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      window.removeEventListener("beforeunload", onUnload);
      // leave the form, untrack presence
      channel.untrack();
      // reflect leaving in team presence
      const teamChannel = supabase
        .getChannels()
        .find((c) => c.topic.startsWith("presence:team_"));
      teamChannel?.track((prev: any) => ({
        ...(typeof prev === "object" ? prev : {}),
        current_form_id: null,
        updated_at: Date.now(),
      }));
      supabase.removeChannel(channel);
    };
  }, [formId, user.id, user.name]);

  // Convenience broadcaster for the form
  const sendCursor = (data: any) => {
    supabase.channel(`form:${formId}`).send({
      type: "broadcast",
      event: "cursor",
      payload: data,
    });
  };

  return { formMembers, sendCursor };
}
