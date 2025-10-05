import { useEffect, useRef } from "react";
import { UUID } from "crypto";
import { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

interface UseFormRealtimeProps {
  formId: string;
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
  supabase: SupabaseClient<any, string, any>;
}

export function useFormRealtime({
  formId,
  onMainCheckboxUpdate,
  onSubCheckboxUpdate,
  onTextInputUpdate,
  channelDisconnected,
  supabase,
}: UseFormRealtimeProps) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!formId) return;

    /*************  ✨ Windsurf Command ⭐  *************/
    /*******  2c2a8218-bf65-4090-89d9-e20ddc317c0e  *******/
    const subscribeToChannel = () => {
      console.log("✅ Subscribing to Supabase Realtime for form:", formId);

      const channel = supabase
        .channel(`realtime-form-${formId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "form_filler",
            table: "main_checkbox",
            filter: `form_id=eq.${formId}`,
          },
          (payload) => {
            const { new: newRow } = payload;
            onMainCheckboxUpdate(
              newRow.id,
              newRow.checked,
              newRow.group_id,
              newRow.updated_by
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "form_filler",
            table: "sub_checkbox",
            filter: `form_id=eq.${formId}`,
          },
          (payload) => {
            const { new: newRow } = payload;
            onSubCheckboxUpdate(
              newRow.id,
              newRow.checked,
              newRow.main_checkbox_id,
              newRow.updated_by
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "form_filler",
            table: "text_input",
            filter: `form_id=eq.${formId}`,
          },
          (payload) => {
            const { new: newRow } = payload;
            onTextInputUpdate(
              newRow.id,
              newRow.value,
              newRow.sub_section_id,
              newRow.updated_by
            );
          }
        )
        .subscribe((status) => {
          console.log("📡 Channel status:", status);

          if (status === "SUBSCRIBED") {
            console.log("✅ Realtime channel is active");
            channelDisconnected && channelDisconnected(false);
          }

          if (
            status === "TIMED_OUT" ||
            status === "CLOSED" ||
            status === "CHANNEL_ERROR"
          ) {
            console.warn("⚠️ Channel disconnected, retrying in 3s...");
            channelDisconnected && channelDisconnected(true);
            setTimeout(() => {
              supabase.removeChannel(channel);
              subscribeToChannel(); // restart the subscription
            }, 3000);
          }
        });

      channelRef.current = channel;
    };

    subscribeToChannel();

    return () => {
      if (channelRef.current) {
        console.log("❌ Removing Supabase channel");
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [formId, supabase]);
}
