import { useEffect, useRef } from "react";
import { UUID } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";

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
  supabase: SupabaseClient<any, string, any>;
}

export function useFormRealtime({
  formId,
  onMainCheckboxUpdate,
  onSubCheckboxUpdate,
  onTextInputUpdate,
  supabase,
}: UseFormRealtimeProps) {
  const subscribed = useRef(false);

  useEffect(() => {
    if (!formId || subscribed.current) return;

    subscribed.current = true;
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
          console.log("new Row", newRow);
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
      .subscribe();

    return () => {
      console.log("❌ Removing Supabase channel");
      supabase.removeChannel(channel);
      subscribed.current = false;
    };
  }, [formId]);
}
